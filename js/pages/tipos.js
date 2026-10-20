'use strict'

// Tipos: um cartão por tipo, com a quantidade de Pokémon vinda da API.
Pages.tipos = (ctx) => {
    const { h, typeLabel, typeColor } = UI
    const area = h('div', {}, UI.loading('Carregando tipos…'))

    PokeAPI.types().then((types) => {
        if (!ctx.isCurrent()) return

        const cards = types.map((type) => {
            const count = h('span', {}, 'Contando…')
            // Cada contagem chega quando a API responder; uma falha não afeta os demais cartões.
            PokeAPI.typeMembers(type.name)
                .then((members) => { count.textContent = `${members.length} Pokémon` })
                .catch(() => { count.textContent = 'Ver Pokémon' })

            return h('li', {},
                h('a', { class: 'type-card', href: `#pokedex?tipo=${encodeURIComponent(type.name)}`, vars: { '--tc': typeColor(type.name) } },
                    h('h2', {}, typeLabel(type.name)),
                    count))
        })

        area.replaceChildren(h('ul', { class: 'type-grid' }, cards))
    }).catch((error) => {
        console.error(error)
        if (ctx.isCurrent()) area.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
    })

    return {
        title: 'Tipos',
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Tipos'),
            h('p', { class: 'lead' }, 'Escolha um tipo para ver os Pokémon que pertencem a ele.'),
            area)
    }
}
