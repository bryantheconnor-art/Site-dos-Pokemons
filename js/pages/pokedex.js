'use strict'

/* ============================================================
   pokedex.js — lista de Pokémon (tela 2 do esboço)
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Mostra 12 Pokémon por vez numa grade de 3 colunas × 4 linhas.
   Os filtros ficam dentro de um bloco recolhível para a tela
   continuar limpa como no desenho:
     - busca por nome ou número;
     - tipo (Fogo, Água...);
     - região (Kanto, Johto...) -> usa o endpoint /generation da API;
     - só favoritos.
   Também atende os endereços antigos #tipos e #favoritos.
   ============================================================ */
Pages.pokedex = (ctx) => {
    const { h, typeLabel, formatName } = UI
    const POR_PAGINA = 12 // 3 colunas × 4 linhas

    // Lê os filtros do endereço (#pokedex?tipo=fire&geracao=1&pagina=2).
    const termo = (ctx.params.get('busca') || '').trim().toLowerCase()
    const tipo = TYPE_INFO[ctx.params.get('tipo')] ? ctx.params.get('tipo') : ''
    const geracao = Object.keys(GERACOES)[Number(ctx.params.get('geracao')) - 1] ? Number(ctx.params.get('geracao')) : 0
    const somenteFavoritos = ctx.params.get('favoritos') === '1'
    const pagina = Math.max(1, parseInt(ctx.params.get('pagina'), 10) || 1)
    const filtrando = Boolean(termo || tipo || geracao || somenteFavoritos)

    // Monta o endereço com os filtros atuais; quem chama pode trocar só uma parte.
    function hrefFor({ page = 1 } = {}) {
        const params = new URLSearchParams()
        if (termo) params.set('busca', termo)
        if (tipo) params.set('tipo', tipo)
        if (geracao) params.set('geracao', geracao)
        if (somenteFavoritos) params.set('favoritos', '1')
        if (page > 1) params.set('pagina', page)
        const consulta = params.toString()
        return `#pokedex${consulta ? `?${consulta}` : ''}`
    }

    // Formulário de filtros. Ao enviar, vira um novo endereço (e o roteador monta a página de novo).
    const formulario = h('form', {
        class: 'filters',
        role: 'search',
        onsubmit: (evento) => {
            evento.preventDefault()
            const dados = new FormData(evento.currentTarget)
            const params = new URLSearchParams()
            if (dados.get('busca').trim()) params.set('busca', dados.get('busca').trim().toLowerCase())
            if (dados.get('tipo')) params.set('tipo', dados.get('tipo'))
            if (dados.get('geracao')) params.set('geracao', dados.get('geracao'))
            if (dados.get('favoritos')) params.set('favoritos', '1')
            const destino = `#pokedex${params.toString() ? `?${params}` : ''}`
            if (window.location.hash === destino) ctx.refresh()
            else window.location.hash = destino
        }
    },
        h('div', {},
            h('label', { for: 'filtro-busca' }, 'Nome ou número'),
            h('input', { id: 'filtro-busca', name: 'busca', type: 'search', value: termo, placeholder: 'Ex.: char ou 6', autocomplete: 'off' })),
        h('div', {},
            h('label', { for: 'filtro-tipo' }, 'Tipo'),
            h('select', { id: 'filtro-tipo', name: 'tipo' },
                h('option', { value: '' }, 'Todos os tipos'),
                Object.keys(TYPE_INFO).map((chave) => h('option', { value: chave, selected: chave === tipo }, typeLabel(chave))))),
        h('div', {},
            h('label', { for: 'filtro-regiao' }, 'Região'),
            h('select', { id: 'filtro-regiao', name: 'geracao' },
                h('option', { value: '' }, 'Todas as regiões'),
                Object.values(GERACOES).map(([romano, regiao], indice) =>
                    h('option', { value: indice + 1, selected: indice + 1 === geracao }, `${regiao} (geração ${romano})`)))),
        h('label', { class: 'check', for: 'filtro-fav' },
            h('input', { id: 'filtro-fav', name: 'favoritos', type: 'checkbox', value: '1', checked: somenteFavoritos }),
            'Só favoritos'),
        h('button', { class: 'btn', type: 'submit' }, 'Aplicar'),
        filtrando && h('a', { class: 'btn btn-ghost', href: '#pokedex' }, 'Limpar'))

    // <details> abre e fecha sozinho (nativo, acessível). Fica aberto quando já há filtro.
    const blocoFiltros = h('details', { class: 'filtros', open: filtrando },
        h('summary', {}, filtrando ? 'Filtros ativos' : 'Buscar e filtrar'),
        formulario)

    const resumo = h('p', { class: 'summary', role: 'status' })
    const resultado = h('div', { class: 'dex-result' })

    // Botões de paginação. O "desativado" é um <span> para não virar link.
    function paginacao(atual, total) {
        const botao = (texto, destino, desativado) => desativado
            ? h('span', { class: 'btn btn-ghost', 'aria-disabled': 'true' }, texto)
            : h('a', { class: 'btn btn-ghost', href: hrefFor({ page: destino }) }, texto)
        return h('nav', { class: 'pager', 'aria-label': 'Paginação da Pokédex' },
            botao('« Primeira', 1, atual === 1),
            botao('‹ Anterior', atual - 1, atual === 1),
            h('span', {}, `Página ${atual} de ${total}`),
            botao('Próxima ›', atual + 1, atual === total),
            botao('Última »', total, atual === total))
    }

    // Busca os dados na API, aplica os filtros e desenha a grade.
    async function carregar() {
        resultado.replaceChildren(UI.loading('Carregando Pokémon…'))
        resumo.textContent = ''

        try {
            let itens = await PokeAPI.allNames() // [{ id, name }] de todas as espécies

            // Cada filtro apenas "poda" a lista, na ordem: favoritos -> tipo -> região -> texto.
            if (somenteFavoritos) {
                const favoritos = new Set(Favorites.list())
                itens = itens.filter((item) => favoritos.has(item.id))
            }
            if (tipo) {
                const ids = new Set((await PokeAPI.typeMembers(tipo)).map((membro) => membro.id))
                itens = itens.filter((item) => ids.has(item.id))
            }
            if (geracao) {
                const ids = new Set((await PokeAPI.generationMembers(geracao)).map((membro) => membro.id))
                itens = itens.filter((item) => ids.has(item.id))
            }
            if (termo) {
                const limpo = termo.replace(/^#/, '')
                if (/^\d+$/.test(limpo)) {
                    // Só números: compara com o número da Pokédex (ignora zeros à esquerda).
                    const numero = String(Number(limpo))
                    itens = itens.filter((item) => String(item.id) === numero)
                } else {
                    const nome = limpo.replace(/\s+/g, '-')
                    itens = itens.filter((item) => item.name.includes(nome))
                }
            }

            if (!ctx.isCurrent()) return // o usuário já mudou de página

            if (itens.length === 0) {
                resumo.textContent = 'Nenhum resultado.'
                resultado.replaceChildren(somenteFavoritos && !termo && !tipo && !geracao
                    ? h('p', {}, 'Você ainda não favoritou nenhum Pokémon. Abra a página de um Pokémon e use o botão “Favorito”.')
                    : h('p', {}, 'Nenhum Pokémon encontrado. Tente outro nome, número, tipo ou região.'))
                return
            }

            const totalPaginas = Math.ceil(itens.length / POR_PAGINA)
            const atual = Math.min(pagina, totalPaginas)
            const fatia = itens.slice((atual - 1) * POR_PAGINA, atual * POR_PAGINA)

            // Pede os 12 Pokémon da página ao mesmo tempo (muito mais rápido do que um por vez).
            const respostas = await Promise.allSettled(fatia.map((item) => PokeAPI.pokemon(item.id)))
            if (!ctx.isCurrent()) return

            // Se algum falhar, o cartão aparece sem imagem em vez de quebrar a página toda.
            const cartoes = respostas.map((resposta, indice) =>
                UI.pokemonCard(resposta.status === 'fulfilled' ? resposta.value : { id: fatia[indice].id, name: fatia[indice].name, types: [] }))

            const partes = []
            if (somenteFavoritos) partes.push('favoritos')
            if (tipo) partes.push(`tipo ${typeLabel(tipo)}`)
            if (geracao) partes.push(`região ${GERACOES[Object.keys(GERACOES)[geracao - 1]][1]}`)
            resumo.textContent = `${itens.length} Pokémon${partes.length ? ` · ${partes.join(' · ')}` : ''} · página ${atual} de ${totalPaginas}`
            resultado.replaceChildren(h('ul', { class: 'dex-grid' }, cartoes), totalPaginas > 1 && paginacao(atual, totalPaginas))
        } catch (erro) {
            console.error(erro)
            if (ctx.isCurrent()) resultado.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
        }
    }

    carregar()

    const tituloAba = somenteFavoritos ? 'Pokédex · Favoritos' : tipo ? `Pokédex · ${typeLabel(tipo)}` : 'Pokédex'
    return {
        title: tituloAba,
        node: h('article', { class: 'page' },
            h('h1', { tabindex: -1 }, 'Pokédex'),
            blocoFiltros,
            resumo,
            resultado)
    }
}
