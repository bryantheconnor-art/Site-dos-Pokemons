'use strict'

// Pokédex: grade 3 × 4 (esboço da tela 2) com busca, barra de tipos (como os elementos do Genshin),
// filtro de favoritos e paginação. Também atende os antigos links #tipos e #favoritos.
Pages.pokedex = (ctx) => {
    const { h, typeLabel, typeColor, formatName } = UI
    const PAGE_SIZE = 12

    const termo = (ctx.params.get('busca') || '').trim().toLowerCase()
    const tipo = TYPE_INFO[ctx.params.get('tipo')] ? ctx.params.get('tipo') : ''
    const somenteFavoritos = ctx.params.get('favoritos') === '1'
    const pagina = Math.max(1, parseInt(ctx.params.get('pagina'), 10) || 1)

    // Monta o hash a partir dos filtros atuais, permitindo trocar partes deles.
    function hrefFor({ busca = termo, tipo: novoTipo = tipo, favoritos = somenteFavoritos, page = 1 } = {}) {
        const params = new URLSearchParams()
        if (busca) params.set('busca', busca)
        if (novoTipo) params.set('tipo', novoTipo)
        if (favoritos) params.set('favoritos', '1')
        if (page > 1) params.set('pagina', page)
        const query = params.toString()
        return `#pokedex${query ? `?${query}` : ''}`
    }

    const form = h('form', {
        class: 'filters',
        role: 'search',
        onsubmit: (event) => {
            event.preventDefault()
            const target = hrefFor({ busca: new FormData(event.currentTarget).get('busca').trim().toLowerCase() })
            if (window.location.hash === target) ctx.refresh()
            else window.location.hash = target
        }
    },
        h('div', {},
            h('label', { for: 'filtro-busca' }, 'Buscar por nome ou número'),
            h('input', { id: 'filtro-busca', name: 'busca', type: 'search', value: termo, placeholder: 'Ex.: char ou 6', autocomplete: 'off' })),
        h('button', { class: 'btn', type: 'submit' }, 'Buscar'),
        (termo || tipo || somenteFavoritos) && h('a', { class: 'btn btn-ghost', href: '#pokedex' }, 'Limpar filtros'))

    // Barra de tipos: links, então funcionam com teclado e leitores de tela; aria-current marca o ativo.
    const pill = (label, href, active, color) => h('li', {},
        h('a', {
            class: 'type-pill', href, 'aria-current': active ? 'true' : null,
            vars: color ? { '--chip': color, '--chip-text': UI.readableTextOn(color) } : {}
        }, label))

    const typeBar = h('nav', { class: 'type-bar', 'aria-label': 'Filtrar por tipo' },
        h('ul', {},
            pill('Todos', hrefFor({ tipo: '', favoritos: false }), !tipo && !somenteFavoritos),
            Object.keys(TYPE_INFO).map((key) => pill(typeLabel(key), hrefFor({ tipo: key, favoritos: false }), tipo === key, typeColor(key))),
            pill('★ Favoritos', hrefFor({ tipo: '', favoritos: true }), somenteFavoritos)))

    const summary = h('p', { class: 'summary', role: 'status' })
    const result = h('div', { class: 'dex-result' })

    function pager(current, total) {
        const link = (label, target, disabled) => disabled
            ? h('span', { class: 'btn btn-ghost', 'aria-disabled': 'true' }, label)
            : h('a', { class: 'btn btn-ghost', href: hrefFor({ page: target }) }, label)
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

            if (somenteFavoritos) {
                const favorites = new Set(Favorites.list())
                items = items.filter((item) => favorites.has(item.id))
            }

            if (tipo) {
                const ids = new Set((await PokeAPI.typeMembers(tipo)).map((member) => member.id))
                items = items.filter((item) => ids.has(item.id))
            }

            if (termo) {
                const clean = termo.replace(/^#/, '')
                if (/^\d+$/.test(clean)) {
                    // Só números: compara com o número da Pokédex (ignora zeros à esquerda).
                    const number = String(Number(clean))
                    items = items.filter((item) => String(item.id) === number)
                } else {
                    const byName = clean.replace(/\s+/g, '-')
                    items = items.filter((item) => item.name.includes(byName))
                }
            }

            if (!ctx.isCurrent()) return

            if (items.length === 0) {
                summary.textContent = 'Nenhum resultado.'
                result.replaceChildren(somenteFavoritos && !termo
                    ? h('p', {}, 'Você ainda não favoritou nenhum Pokémon. Abra a página de um Pokémon e use o botão “Favorito”.')
                    : h('p', {}, 'Nenhum Pokémon encontrado. Tente outro nome, número ou tipo.'))
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

            const filtroTexto = somenteFavoritos ? ' favoritos' : tipo ? ` do tipo ${typeLabel(tipo)}` : ''
            summary.textContent = `${items.length} Pokémon${filtroTexto} · página ${current} de ${totalPages}`
            result.replaceChildren(h('ul', { class: 'dex-grid' }, cards), totalPages > 1 && pager(current, totalPages))
        } catch (error) {
            console.error(error)
            if (ctx.isCurrent()) result.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
        }
    }

    load()

    return {
        title: somenteFavoritos ? 'Pokédex · Favoritos' : tipo ? `Pokédex · ${typeLabel(tipo)}` : 'Pokédex',
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Pokédex'),
            h('p', { class: 'lead' }, 'Doze criaturas por página. Busque pelo nome, escolha um tipo ou veja seus favoritos.'),
            form, typeBar, summary, result)
    }
}
