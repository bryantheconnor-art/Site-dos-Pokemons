'use strict'

// Início: vitrine em duas colunas (estilo Genshin Impact) com o Pokémon do dia em um pergaminho
// (estilo Pottermore), faixa de tipos e 4 cartões grandes (esboço da tela 1).
Pages.home = (ctx) => {
    const { h, typeColor, typeChip, formatName, formatNumber } = UI

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

    // Pokémon do dia: o mesmo para todo mundo no mesmo dia, escolhido pela data local.
    const stage = h('div', { class: 'stage-body' }, UI.loading('Consultando o Atlas…'))

    async function loadDaily() {
        try {
            const names = await PokeAPI.allNames()
            const today = new Date()
            const dayNumber = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 864e5)
            const pick = names[dayNumber % names.length]
            const [pokemon, species] = await Promise.all([PokeAPI.pokemon(pick.id), PokeAPI.species(pick.id).catch(() => null)])
            if (!ctx.isCurrent()) return

            const name = formatName(pokemon.name)
            const types = pokemon.types.map((entry) => entry.type.name)
            const entries = species ? species.flavor_text_entries.filter((entry) => entry.language.name === 'en') : []
            const flavor = entries.length ? entries[entries.length - 1].flavor_text.replace(/[\n\f\r]+/g, ' ') : ''

            stage.parentElement.style.setProperty('--tc', typeColor(types[0]))
            stage.replaceChildren(
                h('div', { class: 'stage-art' },
                    h('span', { class: 'stage-ring', 'aria-hidden': 'true' }),
                    h('img', { src: UI.artworkOf(pokemon), alt: `Arte oficial de ${name}`, width: 320, height: 320, decoding: 'async' })),
                h('h3', { class: 'stage-name' }, name, h('span', { class: 'num' }, formatNumber(pokemon.id))),
                h('div', { class: 'chips chips-center', 'aria-label': 'Tipos' }, types.map((type) => typeChip(type))),
                flavor && h('blockquote', { class: 'parchment', style: 'margin-inline:0' }, h('p', { lang: 'en' }, flavor)),
                h('a', { class: 'btn btn-ghost', href: `#pokemon/${pokemon.id}` }, `Conhecer ${name}`))
        } catch (error) {
            console.error(error)
            if (ctx.isCurrent()) stage.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
        }
    }
    loadDaily()

    const typeStrip = h('ul', { class: 'type-strip' }, Object.keys(TYPE_INFO).map((type) => h('li', {}, typeChip(type, { link: true }))))

    const cards = [
        { href: '#pokedex', id: 25, name: 'Pikachu', title: 'Pokédex', text: 'Navegue por todas as espécies com busca por nome e filtro por tipo.', color: typeColor('electric') },
        { href: '#aleatorio', id: 132, name: 'Ditto', title: 'Pokémon aleatório', text: 'Deixe o acaso escolher e descubra um Pokémon surpresa.', color: typeColor('psychic') },
        { href: '#pokedex?favoritos=1', id: 133, name: 'Eevee', title: 'Favoritos', text: 'Guarde seus preferidos neste navegador e volte a eles quando quiser.', color: typeColor('normal') },
        { href: '#sobre', id: 479, name: 'Rotom', title: 'Sobre o Atlas', text: 'Conheça o projeto, a API por trás dele e o esboço que o originou.', color: typeColor('ghost') }
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
                h('div', { class: 'hero-text' },
                    h('p', { class: 'eyebrow' }, 'Enciclopédia interativa'),
                    h('h1', { id: 'titulo-inicio', tabindex: -1 }, 'Atlas Pokémon'),
                    h('div', { class: 'ornament', 'aria-hidden': 'true' }, h('span')),
                    h('p', { class: 'lead' }, 'Explore criaturas, tipos e linhas evolutivas com dados ao vivo da PokéAPI.'),
                    search,
                    h('div', { class: 'hero-actions' },
                        h('a', { class: 'btn', href: '#pokedex' }, 'Explorar a Pokédex'),
                        h('a', { class: 'btn btn-ghost', href: '#aleatorio' }, 'Pokémon aleatório')),
                    h('ul', { class: 'hero-stats' },
                        h('li', {}, speciesCount, h('span', {}, 'espécies catalogadas')),
                        h('li', {}, typeCount, h('span', {}, 'tipos elementais')))),
                h('aside', { class: 'stage', 'aria-labelledby': 'titulo-dia' },
                    h('h2', { id: 'titulo-dia', class: 'stage-title' }, 'Pokémon do dia'),
                    stage)),
            h('section', { 'aria-labelledby': 'titulo-tipos' },
                h('h2', { id: 'titulo-tipos' }, 'Escolha um tipo'),
                typeStrip),
            h('section', { 'aria-labelledby': 'por-onde-comecar' },
                h('h2', { id: 'por-onde-comecar' }, 'Por onde começar?'),
                grid))
    }
}
