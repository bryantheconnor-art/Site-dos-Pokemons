'use strict'

// Pokédex: grade 3 × 4 (esboço da tela 2) com busca, filtro por tipo e paginação.
Pages.pokedex = (ctx) => {
    const { h, typeLabel, formatName } = UI
    const PAGE_SIZE = 12

    const termo = (ctx.params.get('busca') || '').trim().toLowerCase()
    const tipo = TYPE_INFO[ctx.params.get('tipo')] ? ctx.params.get('tipo') : ''
    const pagina = Math.max(1, parseInt(ctx.params.get('pagina'), 10) || 1)

    // Monta o hash mantendo os filtros ativos.
    function hrefFor(page) {
        const params = new URLSearchParams()
        if (termo) params.set('busca', termo)
        if (tipo) params.set('tipo', tipo)
        if (page > 1) params.set('pagina', page)
        const query = params.toString()
        return `#pokedex${query ? `?${query}` : ''}`
    }

    const form = h('form', {
        class: 'filters',
        role: 'search',
        onsubmit: (event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            const params = new URLSearchParams()
            if (data.get('busca').trim()) params.set('busca', data.get('busca').trim())
            if (data.get('tipo')) params.set('tipo', data.get('tipo'))
            const target = `#pokedex${params.toString() ? `?${params}` : ''}`
            if (window.location.hash === target) ctx.refresh()
            else window.location.hash = target
        }
    },
        h('div', {},
            h('label', { for: 'filtro-busca' }, 'Nome ou número'),
            h('input', { id: 'filtro-busca', name: 'busca', type: 'search', value: termo, placeholder: 'Ex.: char ou 6', autocomplete: 'off' })),
        h('div', {},
            h('label', { for: 'filtro-tipo' }, 'Tipo'),
            h('select', { id: 'filtro-tipo', name: 'tipo' },
                h('option', { value: '' }, 'Todos os tipos'),
                Object.keys(TYPE_INFO).map((key) => h('option', { value: key, selected: key === tipo }, typeLabel(key))))),
        h('button', { class: 'btn', type: 'submit' }, 'Filtrar'),
        (termo || tipo) && h('a', { class: 'btn btn-ghost', href: '#pokedex' }, 'Limpar filtros'))

    const summary = h('p', { class: 'summary', role: 'status' })
    const result = h('div', { class: 'dex-result' })

    function pager(current, total) {
        const link = (label, target, disabled) => disabled
            ? h('span', { class: 'btn btn-ghost', 'aria-disabled': 'true' }, label)
            : h('a', { class: 'btn btn-ghost', href: hrefFor(target) }, label)
        return h('nav', { class: 'pager', 'aria-label': 'Paginação da Pokédex' },
            link('« Primeira', 1, current === 1),
            link('‹ Anterior', current - 1, current === 1),
            h('span', {}, `Página ${current} de ${total}`),
            link('Próxima ›', current + 1, current === total),
            link('Última »', total, current === total))
    }

    async function load() {
        result.replaceChildren(UI.loading('Carregando Pokémon…'))
        summary.textContent = ''

        try {
            let items = await PokeAPI.allNames()

            if (tipo) {
                const ids = new Set((await PokeAPI.typeMembers(tipo)).map((member) => member.id))
                items = items.filter((item) => ids.has(item.id))
            }

            if (termo) {
                const byName = termo.replace(/^#/, '').replace(/\s+/g, '-')
                const byNumber = termo.replace(/^#/, '').replace(/^0+(?=\d)/, '')
                items = items.filter((item) => item.name.includes(byName) || String(item.id) === byNumber)
            }

            if (!ctx.isCurrent()) return

            if (items.length === 0) {
                summary.textContent = 'Nenhum resultado.'
                result.replaceChildren(h('p', {}, 'Nenhum Pokémon encontrado. Tente outro nome, número ou tipo.'))
                return
            }

            const totalPages = Math.ceil(items.length / PAGE_SIZE)
            const current = Math.min(pagina, totalPages)
            const slice = items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

            const settled = await Promise.allSettled(slice.map((item) => PokeAPI.pokemon(item.id)))
            if (!ctx.isCurrent()) return

            // Se um Pokémon falhar, o cartão aparece sem imagem em vez de quebrar a página.
            const cards = settled.map((entry, index) =>
                UI.pokemonCard(entry.status === 'fulfilled' ? entry.value : { id: slice[index].id, name: slice[index].name, types: [] }))

            const filtroTexto = tipo ? ` do tipo ${typeLabel(tipo)}` : ''
            summary.textContent = `${items.length} Pokémon${filtroTexto} · página ${current} de ${totalPages}`
            result.replaceChildren(h('ul', { class: 'dex-grid' }, cards), totalPages > 1 && pager(current, totalPages))
        } catch (error) {
            console.error(error)
            if (ctx.isCurrent()) result.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
        }
    }

    load()

    return {
        title: tipo ? `Pokédex · ${typeLabel(tipo)}` : 'Pokédex',
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Pokédex'),
            h('p', { class: 'lead' }, 'Doze criaturas por página. Use a busca ou filtre por tipo.'),
            form, summary, result)
    }
}
