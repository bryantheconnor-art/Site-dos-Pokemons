'use strict'

// Favoritos: lista salva no navegador (localStorage), exibida na mesma grade da Pokédex.
Pages.favoritos = (ctx) => {
    const { h } = UI
    const ids = Favorites.list()
    const area = h('div', {})

    if (ids.length === 0) {
        area.append(
            h('p', {}, 'Você ainda não favoritou nenhum Pokémon. Abra a página de um Pokémon e use o botão “Favorito”.'),
            h('a', { class: 'btn', href: '#pokedex' }, 'Explorar a Pokédex'))
    } else {
        area.append(UI.loading('Carregando favoritos…'))
        Promise.allSettled(ids.map((id) => PokeAPI.pokemon(id))).then((settled) => {
            if (!ctx.isCurrent()) return
            const cards = settled.map((entry, index) =>
                UI.pokemonCard(entry.status === 'fulfilled' ? entry.value : { id: ids[index], name: `pokemon-${ids[index]}`, types: [] }))
            area.replaceChildren(
                h('p', { class: 'summary' }, `${ids.length} ${ids.length === 1 ? 'favorito' : 'favoritos'}`),
                h('ul', { class: 'dex-grid' }, cards))
        })
    }

    return {
        title: 'Favoritos',
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Favoritos'),
            h('p', { class: 'lead' }, 'Seus Pokémon preferidos, guardados apenas neste navegador.'),
            area)
    }
}
