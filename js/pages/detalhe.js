'use strict'

// Detalhe: imagem grande + informações + linha evolutiva (esboço da tela 3).
Pages.pokemon = (ctx) => {
    const { h, formatName, formatNumber, typeChip, typeColor } = UI
    const key = ctx.args[0] || ''

    const title = h('h1', { class: 'detail-title', tabindex: -1 }, 'Carregando…')
    const body = h('div', {}, UI.loading('Carregando dados do Pokémon…'))

    async function load() {
        try {
            const [pokemon, species, names] = await Promise.all([
                PokeAPI.pokemon(key),
                PokeAPI.species(key).catch(() => null), // formas alternativas não têm espécie com o mesmo nome
                PokeAPI.allNames().catch(() => [])
            ])
            if (!ctx.isCurrent()) return

            const name = formatName(pokemon.name)
            ctx.setTitle(name)
            title.replaceChildren(name, h('span', { class: 'num' }, formatNumber(pokemon.id)))

            const types = pokemon.types.map((entry) => entry.type.name)
            const color = typeColor(types[0])
            const art = pokemon.sprites.other['official-artwork']
            const normalArt = art.front_default || pokemon.sprites.front_default
            const shinyArt = art.front_shiny || null

            // Imagem grande, com alternância para a versão brilhante (shiny).
            const image = h('img', { src: normalArt, alt: `Arte oficial de ${name}`, width: 420, height: 420 })
            const actions = h('div', { class: 'detail-actions' })

            if (shinyArt) {
                const shinyButton = h('button', {
                    class: 'btn btn-ghost', type: 'button', 'aria-pressed': 'false',
                    onclick: () => {
                        const on = shinyButton.getAttribute('aria-pressed') !== 'true'
                        shinyButton.setAttribute('aria-pressed', String(on))
                        image.src = on ? shinyArt : normalArt
                        image.alt = `Arte oficial de ${name}${on ? ' (variante brilhante)' : ''}`
                    }
                }, '✨ Variante brilhante')
                actions.append(shinyButton)
            }

            const favoriteButton = h('button', {
                class: 'btn btn-ghost', type: 'button', 'aria-pressed': String(Favorites.has(pokemon.id)),
                onclick: () => {
                    const added = Favorites.toggle(pokemon.id)
                    favoriteButton.setAttribute('aria-pressed', String(added))
                    ctx.announce(added ? `${name} adicionado aos favoritos.` : `${name} removido dos favoritos.`)
                }
            }, '★ Favorito')
            actions.append(favoriteButton)

            // Texto da Pokédex (a PokéAPI só oferece em inglês, entre outros idiomas).
            const entries = species ? species.flavor_text_entries.filter((entry) => entry.language.name === 'en') : []
            const genus = species ? (species.genera.find((item) => item.language.name === 'en') || {}).genus : ''
            const flavor = entries.length ? entries[entries.length - 1].flavor_text.replace(/[\n\f\r]+/g, ' ') : ''

            const abilities = pokemon.abilities.map((entry) =>
                formatName(entry.ability.name) + (entry.is_hidden ? ' (oculta)' : '')).join(', ')

            const stats = h('ul', { class: 'stats' }, pokemon.stats.map((entry) => {
                const value = entry.base_stat
                return h('li', { class: 'stat' },
                    h('span', { class: 'stat-name' }, STAT_LABELS[entry.stat.name] || formatName(entry.stat.name)),
                    h('span', { class: 'stat-value' }, value),
                    h('span', { class: 'bar', 'aria-hidden': 'true' }, h('span', { style: `width:${Math.min(100, (value / 255) * 100)}%` })))
            }))

            const info = h('div', { class: 'detail-info' },
                genus && h('p', { class: 'eyebrow', lang: 'en' }, genus),
                h('div', { class: 'chips', 'aria-label': 'Tipos' }, types.map((type) => typeChip(type, { link: true }))),
                flavor && h('blockquote', { class: 'parchment', style: 'margin-inline:0' },
                    h('p', { lang: 'en' }, flavor),
                    h('small', {}, 'Texto original da Pokédex, em inglês.')),
                h('dl', { class: 'facts' },
                    h('div', {}, h('dt', {}, 'Altura'), h('dd', {}, `${(pokemon.height / 10).toLocaleString('pt-BR')} m`)),
                    h('div', {}, h('dt', {}, 'Peso'), h('dd', {}, `${(pokemon.weight / 10).toLocaleString('pt-BR')} kg`)),
                    h('div', {}, h('dt', {}, 'Habilidades'), h('dd', {}, abilities))),
                h('section', { 'aria-labelledby': 'titulo-stats' },
                    h('h2', { id: 'titulo-stats', style: 'margin-top:8px;font-size:22px' }, 'Atributos base'),
                    stats))

            // Anterior / próximo na Pokédex nacional.
            const index = names.findIndex((item) => item.id === pokemon.id)
            const previous = index > 0 ? names[index - 1] : null
            const next = index >= 0 && index < names.length - 1 ? names[index + 1] : null
            const navigation = h('nav', { class: 'pokemon-nav', 'aria-label': 'Navegar entre Pokémon' },
                previous ? h('a', { class: 'btn btn-ghost', href: `#pokemon/${previous.id}` }, `‹ ${formatName(previous.name)}`) : h('span'),
                next ? h('a', { class: 'btn btn-ghost', href: `#pokemon/${next.id}` }, `${formatName(next.name)} ›`) : h('span'))

            const evolution = h('section', { 'aria-labelledby': 'titulo-evolucao' },
                h('h2', { id: 'titulo-evolucao' }, 'Linha evolutiva'),
                h('div', {}, UI.loading('Carregando evolução…')))

            body.replaceChildren(
                h('div', { class: 'detail-grid', vars: { '--tc': color } },
                    h('figure', { class: 'detail-art' }, image, actions),
                    info),
                evolution,
                navigation)

            loadEvolution(species, pokemon.id, evolution)
        } catch (error) {
            if (!ctx.isCurrent()) return
            if (error.status !== 404) console.error(error)
            if (error.status === 404) {
                title.textContent = 'Pokémon não encontrado'
                ctx.setTitle('Pokémon não encontrado')
                body.replaceChildren(h('p', {}, `Não existe nenhum Pokémon chamado “${key}”.`), h('a', { class: 'btn', href: '#pokedex' }, 'Ir para a Pokédex'))
            } else {
                title.textContent = 'Pokémon'
                body.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
            }
        }
    }

    async function loadEvolution(species, currentId, section) {
        const target = section.querySelector('div')
        try {
            if (!species) {
                target.replaceChildren(h('p', {}, 'Sem dados de evolução para esta forma.'))
                return
            }
            const chain = await PokeAPI.evolutionChain(species.evolution_chain.url)
            if (!ctx.isCurrent()) return
            const stages = PokeAPI.flattenChain(chain.chain)

            if (stages.length === 1) {
                target.replaceChildren(h('p', {}, 'Este Pokémon não possui evoluções.'))
                return
            }

            const list = h('ol', { class: 'evo' }, stages.map((stage) =>
                h('li', {}, h('ul', { class: 'evo-stage' }, stage.map((member) =>
                    h('li', {},
                        h('a', {
                            class: 'dex-card', href: `#pokemon/${member.id}`,
                            'aria-current': member.id === currentId ? 'page' : null
                        },
                        h('img', { src: PokeAPI.artwork(member.id), alt: '', width: 96, height: 96, loading: 'lazy', decoding: 'async' }),
                        h('span', { class: 'dex-name' }, formatName(member.name)))))))))

            target.replaceChildren(list)
        } catch (error) {
            console.error(error)
            if (ctx.isCurrent()) target.replaceChildren(UI.errorBox('Não foi possível carregar a linha evolutiva.'))
        }
    }

    load()

    return {
        title: 'Pokémon',
        node: h('article', { class: 'page page-detail' },
            h('a', { class: 'back-link', href: '#pokedex' }, '‹ Voltar à Pokédex'),
            title,
            body)
    }
}

// Sorteia um Pokémon e redireciona para a página dele.
Pages.aleatorio = (ctx) => {
    PokeAPI.allNames()
        .then((names) => names[Math.floor(Math.random() * names.length)].id)
        .catch(() => Math.floor(Math.random() * 1025) + 1)
        .then((id) => { if (ctx.isCurrent()) window.location.replace(`#pokemon/${id}`) })

    return {
        title: 'Pokémon aleatório',
        node: UI.h('article', { class: 'page' },
            UI.h('h1', { class: 'sr-only', tabindex: -1 }, 'Pokémon aleatório'),
            UI.loading('Sorteando um Pokémon…'))
    }
}
