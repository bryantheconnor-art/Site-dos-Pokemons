'use strict'

// Início: apresentação, busca rápida e 4 cartões grandes (esboço da tela 1).
Pages.home = (ctx) => {
    const { h, typeColor } = UI

    const speciesCount = h('strong', {}, '…')
    const typeCount = h('strong', {}, '…')

    // Números vindos da API; se falharem, o restante da página continua funcionando.
    PokeAPI.speciesCount().then((count) => { if (ctx.isCurrent()) speciesCount.textContent = count }).catch(() => { speciesCount.textContent = '—' })
    PokeAPI.types().then((types) => { if (ctx.isCurrent()) typeCount.textContent = types.length }).catch(() => { typeCount.textContent = '—' })

    const search = h('form', {
        class: 'hero-search',
        role: 'search',
        onsubmit: (event) => {
            event.preventDefault()
            const term = new FormData(event.currentTarget).get('busca').trim()
            window.location.hash = term ? `#pokedex?busca=${encodeURIComponent(term)}` : '#pokedex'
        }
    },
        h('label', { class: 'sr-only', for: 'busca-inicio' }, 'Buscar Pokémon por nome ou número'),
        h('input', { id: 'busca-inicio', name: 'busca', type: 'search', placeholder: 'Ex.: pikachu ou 25', autocomplete: 'off' }),
        h('button', { class: 'btn', type: 'submit' }, 'Buscar na Pokédex'))

    const cards = [
        { href: '#pokedex', id: 25, name: 'Pikachu', title: 'Pokédex', text: 'Navegue por todas as espécies com busca por nome e filtro por tipo.', color: typeColor('electric') },
        { href: '#tipos', id: 6, name: 'Charizard', title: 'Tipos', text: 'Conheça os 18 tipos e veja quais Pokémon pertencem a cada um.', color: typeColor('fire') },
        { href: '#aleatorio', id: 132, name: 'Ditto', title: 'Pokémon aleatório', text: 'Deixe o acaso escolher e descubra um Pokémon surpresa.', color: typeColor('psychic') },
        { href: '#favoritos', id: 133, name: 'Eevee', title: 'Favoritos', text: 'Guarde seus preferidos neste navegador e volte a eles quando quiser.', color: typeColor('normal') }
    ]

    const grid = h('ul', { class: 'feature-grid' }, cards.map((card) =>
        h('li', {},
            h('a', { class: 'feature-card', href: card.href, vars: { '--tc': card.color } },
                h('img', { src: PokeAPI.artwork(card.id), alt: `Arte oficial de ${card.name}`, width: 190, height: 190, loading: 'lazy', decoding: 'async' }),
                h('h3', {}, card.title),
                h('p', {}, card.text),
                h('span', { class: 'more', 'aria-hidden': 'true' }, 'Explorar →')))))

    return {
        title: 'Atlas Pokémon',
        node: h('article', { class: 'page' },
            h('section', { class: 'hero', 'aria-labelledby': 'titulo-inicio' },
                h('p', { class: 'eyebrow' }, 'Enciclopédia interativa'),
                h('h1', { id: 'titulo-inicio', tabindex: -1 }, 'Atlas Pokémon'),
                h('div', { class: 'ornament', 'aria-hidden': 'true' }, h('span')),
                h('p', { class: 'lead' }, 'Explore criaturas, tipos e linhas evolutivas com dados ao vivo da PokéAPI.'),
                search,
                h('ul', { class: 'hero-stats' },
                    h('li', {}, speciesCount, h('span', {}, 'espécies catalogadas')),
                    h('li', {}, typeCount, h('span', {}, 'tipos elementais')))),
            h('section', { 'aria-labelledby': 'por-onde-comecar' },
                h('h2', { id: 'por-onde-comecar' }, 'Por onde começar?'),
                grid))
    }
}
