'use strict'

/* ============================================================
   home.js — página inicial (tela 1 do esboço)
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Estrutura, de cima para baixo:
     1) banner grande com vários Pokémon reunidos (artes oficiais da API);
     2) quatro cartões grandes em grade 2 × 2, como no desenho:
        Pokédex, Pokémon do dia, Favoritos e Sobre.
   ============================================================ */
Pages.home = (ctx) => {
    const { h, typeColor, typeLabel, formatName, formatNumber } = UI

    /* Os Pokémon do banner. Cada linha é:
       [número, nome, posição horizontal %, altura do chão %, tamanho %, camada, atraso da animação, some no celular?]
       Quem tem camada maior fica na frente. Os de trás ficam mais altos para parecer uma foto de grupo. */
    const MONTAGEM = [
        [3, 'Venusaur', 14, 15, 26, 1, '0s', false],
        [150, 'Mewtwo', 50, 17, 29, 1, '-1.5s', false],
        [149, 'Dragonite', 85, 13, 27, 1, '-3s', true],
        [94, 'Gengar', 7, 0, 15, 3, '-4s', true],
        [9, 'Blastoise', 24, 0, 24, 3, '-2s', false],
        [133, 'Eevee', 38, 0, 13, 4, '-1s', false],
        [25, 'Pikachu', 50, -1, 18, 5, '-2.5s', false],
        [448, 'Lucario', 63, 0, 16, 4, '-3.5s', true],
        [6, 'Charizard', 76, 0, 25, 3, '-0.5s', false],
        [143, 'Snorlax', 93, 0, 18, 3, '-4.5s', true]
    ]

    const imagens = MONTAGEM.map(([id, , x, y, tamanho, camada, atraso, opcional]) =>
        h('img', {
            class: opcional ? 'opcional' : null,
            src: PokeAPI.artwork(id),
            alt: '', // decorativa: o grupo inteiro é descrito pelo aria-label da montagem
            'aria-hidden': 'true',
            width: 475,
            height: 475,
            decoding: 'async',
            vars: { '--x': `${x}%`, '--y': `${y}%`, '--s': `${tamanho}%`, '--z': camada, '--d': atraso }
        }))

    const descricaoMontagem = `Montagem com Pokémon reunidos: ${MONTAGEM.map((item) => item[1]).join(', ')}.`

    // 1) Banner: título e botões em cima, os Pokémon logo abaixo.
    const banner = h('section', { class: 'banner', 'aria-labelledby': 'titulo-inicio' },
        h('div', { class: 'banner-text' },
            h('p', { class: 'eyebrow' }, 'Enciclopédia interativa'),
            h('h1', { id: 'titulo-inicio', tabindex: -1 }, 'Atlas Pokémon'),
            h('div', { class: 'ornament', 'aria-hidden': 'true' }, h('span')),
            h('p', { class: 'lead' }, 'Conheça criaturas, tipos e linhas evolutivas com dados ao vivo da PokéAPI, tudo em português.'),
            h('div', { class: 'banner-actions' },
                h('a', { class: 'btn', href: '#pokedex' }, 'Explorar a Pokédex'),
                h('a', { class: 'btn btn-ghost', href: '#aleatorio' }, 'Pokémon aleatório'))),
        h('div', { class: 'banner-art', role: 'img', 'aria-label': descricaoMontagem }, imagens))

    // 2) Cartões 2 × 2. Cada cartão tem uma "área da arte" com altura fixa para a página não pular quando a imagem chega.
    function cartao({ href, id, nome, titulo, texto, cor }) {
        return h('li', {},
            h('a', { class: 'feature-card', href, vars: { '--tc': cor } },
                h('div', { class: 'feature-art' },
                    h('img', { src: PokeAPI.artwork(id), alt: `Arte oficial de ${nome}`, width: 190, height: 190, loading: 'lazy', decoding: 'async' })),
                h('h3', {}, titulo),
                h('p', {}, texto),
                h('span', { class: 'more', 'aria-hidden': 'true' }, 'Explorar →')))
    }

    // O cartão "Pokémon do dia" começa com um aviso de carregamento e é preenchido com dados da API.
    const areaDoDia = h('div', { class: 'feature-art' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }))
    const tituloDoDia = h('h3', {}, 'Pokémon do dia')
    const textoDoDia = h('p', {}, 'Consultando a PokéAPI…')
    const linkDoDia = h('a', { class: 'feature-card', href: '#pokedex' }, areaDoDia, tituloDoDia, textoDoDia,
        h('span', { class: 'more', 'aria-hidden': 'true' }, 'Conhecer →'))

    async function carregarPokemonDoDia() {
        try {
            const nomes = await PokeAPI.allNames()
            // O número do dia (dias desde 1970, na data local) escolhe sempre o mesmo Pokémon durante o dia inteiro.
            const hoje = new Date()
            const numeroDoDia = Math.floor(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) / 864e5)
            const escolhido = nomes[numeroDoDia % nomes.length]
            const pokemon = await PokeAPI.pokemon(escolhido.id)
            if (!ctx.isCurrent()) return

            const tipos = pokemon.types.map((entrada) => entrada.type.name)
            const nome = formatName(pokemon.name)
            linkDoDia.href = `#pokemon/${pokemon.id}`
            linkDoDia.style.setProperty('--tc', typeColor(tipos[0]))
            areaDoDia.replaceChildren(h('img', { src: UI.artworkOf(pokemon), alt: `Arte oficial de ${nome}`, width: 190, height: 190, decoding: 'async' }))
            tituloDoDia.textContent = `Pokémon do dia: ${nome}`
            textoDoDia.textContent = `${formatNumber(pokemon.id)} · tipo ${tipos.map(typeLabel).join(' e ')}. Mude todos os dias.`
        } catch (erro) {
            console.error(erro)
            if (!ctx.isCurrent()) return
            areaDoDia.replaceChildren()
            textoDoDia.textContent = 'Não foi possível consultar a API agora. Abra a Pokédex para tentar de novo.'
        }
    }
    carregarPokemonDoDia()

    const grade = h('ul', { class: 'feature-grid' },
        cartao({ href: '#pokedex', id: 25, nome: 'Pikachu', titulo: 'Pokédex', texto: 'Todas as espécies, com busca por nome ou número e filtros por tipo e região.', cor: typeColor('electric') }),
        h('li', {}, linkDoDia),
        cartao({ href: '#pokedex?favoritos=1', id: 133, nome: 'Eevee', titulo: 'Favoritos', texto: 'Guarde seus preferidos neste navegador e volte a eles quando quiser.', cor: typeColor('normal') }),
        cartao({ href: '#sobre', id: 479, nome: 'Rotom', titulo: 'Sobre o Atlas', texto: 'Conheça o projeto, as APIs por trás dele, o autor e o esboço que o originou.', cor: typeColor('ghost') }))

    return {
        title: SITE.nome,
        node: h('article', { class: 'page' },
            banner,
            h('section', { 'aria-labelledby': 'por-onde-comecar' },
                h('h2', { id: 'por-onde-comecar' }, 'Por onde começar?'),
                grade))
    }
}
