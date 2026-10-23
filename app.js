'use strict'

/* ============================================================
   app.js — roteador do site (a "central" que troca as páginas)
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Como funciona: o endereço usa "hash" (a parte depois do #).
     #home            -> página inicial
     #pokedex?pagina=2-> lista de Pokémon
     #pokemon/25      -> detalhe do Pokémon número 25
     #sobre           -> sobre o projeto
   Quando o hash muda, renderPage() descobre qual página montar,
   coloca o resultado dentro de <main> e cuida do título da aba,
   do foco do teclado e dos avisos para leitores de tela.
   Como não recarrega a página, o site é rápido (é uma SPA).
   ============================================================ */
const main = document.getElementById('conteudo')
const live = document.getElementById('anuncio')
const navigationLinks = document.querySelectorAll('.site-header nav a')

let renderToken = 0 // número da renderização atual; serve para ignorar respostas atrasadas da API
let firstRender = true // na primeira vez não mexemos no foco do teclado

// Endereços antigos continuam funcionando e apontam para as 4 páginas atuais.
const ALIASES = {
    about: { name: 'sobre' },
    contato: { name: 'sobre' },
    tipos: { name: 'pokedex' },
    favoritos: { name: 'pokedex', params: { favoritos: '1' } }
}

function safeDecode(valor) {
    try { return decodeURIComponent(valor) } catch (erro) { return valor }
}

// Quebra "#pokedex?tipo=fire&pagina=2" em { name: 'pokedex', args: [], params: {tipo, pagina} }.
function parseHash() {
    const bruto = window.location.hash.replace(/^#\/?/, '')
    const [caminho, consulta = ''] = bruto.split('?')
    const [primeiro = 'home', ...args] = caminho.split('/').filter(Boolean)
    const alias = ALIASES[primeiro]
    const params = new URLSearchParams(consulta)
    if (alias && alias.params) Object.entries(alias.params).forEach(([chave, valor]) => params.set(chave, valor))
    return { name: alias ? alias.name : primeiro, args: args.map(safeDecode), params }
}

// Avisa leitores de tela sem mudar o foco do teclado.
function announce(mensagem) {
    live.textContent = ''
    window.setTimeout(() => { live.textContent = mensagem }, 50)
}

// Página mostrada quando o endereço não existe.
Pages.notFound = () => {
    const { h } = UI
    return {
        title: 'Página não encontrada',
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Página não encontrada'),
            h('p', { class: 'lead' }, `Esse caminho não existe na ${SITE.nome}.`),
            h('a', { class: 'btn', href: '#home' }, 'Voltar ao início'))
    }
}

// Monta a página que corresponde ao endereço atual.
function renderPage() {
    const token = ++renderToken
    const { name, args, params } = parseHash()
    const page = Pages[name] || Pages.notFound

    // "ctx" é o que entregamos para cada página: dados do endereço + utilidades.
    const ctx = {
        name,
        args,
        params,
        isCurrent: () => token === renderToken, // false = o usuário já foi para outra página
        setTitle: (titulo) => { if (token === renderToken) document.title = `${titulo} · ${SITE.nome}` },
        announce: (mensagem) => { if (token === renderToken) announce(mensagem) },
        refresh: renderPage
    }

    let view
    try {
        view = page(ctx)
    } catch (erro) {
        console.error(erro)
        view = {
            title: 'Erro',
            node: UI.h('article', { class: 'page' },
                UI.h('h1', { tabindex: -1 }, 'Algo deu errado'),
                UI.errorBox('Não foi possível montar esta página.', renderPage))
        }
    }

    document.title = view.title === SITE.nome ? SITE.nome : `${view.title} · ${SITE.nome}`
    main.replaceChildren(view.node)

    // Marca no menu a seção atual (o detalhe de um Pokémon pertence à Pokédex).
    const secao = name === 'pokemon' ? 'pokedex' : name
    navigationLinks.forEach((link) => {
        if (link.hash === `#${secao}`) link.setAttribute('aria-current', 'page')
        else link.removeAttribute('aria-current')
    })

    // Depois da primeira página: volta ao topo e coloca o foco no título (ajuda quem usa teclado/leitor de tela).
    if (!firstRender) {
        window.scrollTo(0, 0)
        const titulo = main.querySelector('h1')
        if (titulo) titulo.focus({ preventScroll: true })
    }
    firstRender = false
}

// O link "pular para o conteúdo" não pode mudar o hash (o roteador usa o hash), então tratamos o clique.
document.querySelector('.skip-link').addEventListener('click', (evento) => {
    evento.preventDefault()
    main.focus()
    main.scrollIntoView()
})

window.addEventListener('hashchange', renderPage) // roda quando o usuário clica num link interno
renderPage() // e uma vez ao abrir o site
