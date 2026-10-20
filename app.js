'use strict'

// Roteador: lê o hash da URL (#pokedex?pagina=2, #pokemon/25), monta a página
// correspondente em <main> e cuida de título, foco e avisos para leitores de tela.
const main = document.getElementById('conteudo')
const live = document.getElementById('anuncio')
const navigationLinks = document.querySelectorAll('.site-header nav a')
const SITE_NAME = 'Atlas Pokémon'

let renderToken = 0
let firstRender = true

// Nomes antigos do projeto base continuam funcionando.
const ALIASES = { about: 'sobre', contato: 'sobre' }

function safeDecode(value) {
    try { return decodeURIComponent(value) } catch (error) { return value }
}

function parseHash() {
    const raw = window.location.hash.replace(/^#\/?/, '')
    const [path, query = ''] = raw.split('?')
    const [first = 'home', ...args] = path.split('/').filter(Boolean)
    const name = ALIASES[first] || first
    return { name, args: args.map(safeDecode), params: new URLSearchParams(query) }
}

// Avisa leitores de tela sem mudar o foco.
function announce(message) {
    live.textContent = ''
    window.setTimeout(() => { live.textContent = message }, 50)
}

Pages.notFound = (ctx) => {
    const { h } = UI
    return {
        title: 'Página não encontrada',
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Página não encontrada'),
            h('p', { class: 'lead' }, 'Esse caminho não existe no Atlas.'),
            h('a', { class: 'btn', href: '#home' }, 'Voltar ao início'))
    }
}

function renderPage() {
    const token = ++renderToken
    const { name, args, params } = parseHash()
    const page = Pages[name] || Pages.notFound

    const ctx = {
        name,
        args,
        params,
        isCurrent: () => token === renderToken,
        setTitle: (title) => { if (token === renderToken) document.title = `${title} · ${SITE_NAME}` },
        announce: (message) => { if (token === renderToken) announce(message) },
        refresh: renderPage
    }

    let view
    try {
        view = page(ctx)
    } catch (error) {
        console.error(error)
        view = {
            title: 'Erro',
            node: UI.h('article', { class: 'page' },
                UI.h('h1', { tabindex: -1 }, 'Algo deu errado'),
                UI.errorBox('Não foi possível montar esta página.', renderPage))
        }
    }

    document.title = view.title === SITE_NAME ? SITE_NAME : `${view.title} · ${SITE_NAME}`
    main.replaceChildren(view.node)

    // O link da seção atual recebe aria-current (o pokémon pertence à Pokédex).
    const section = name === 'pokemon' ? 'pokedex' : name
    navigationLinks.forEach((link) => {
        if (link.hash === `#${section}`) link.setAttribute('aria-current', 'page')
        else link.removeAttribute('aria-current')
    })

    // Em navegações posteriores, volta ao topo e foca o título da nova página.
    if (!firstRender) {
        window.scrollTo(0, 0)
        const heading = main.querySelector('h1')
        if (heading) heading.focus({ preventScroll: true })
    }
    firstRender = false
}

// O link "pular para o conteúdo" não pode alterar o hash, que é usado pelo roteador.
document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault()
    main.focus()
    main.scrollIntoView()
})

window.addEventListener('hashchange', renderPage)
renderPage()
