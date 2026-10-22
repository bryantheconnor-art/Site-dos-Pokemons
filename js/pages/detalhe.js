'use strict'

/* ============================================================
   detalhe.js — página de um Pokémon (tela 3 do esboço)
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Parte de cima, igual ao desenho:
     - imagem grande à esquerda;
     - à direita: nome, tipos, descrição e informações principais;
     - embaixo, uma fileira de ícones (linha evolutiva).
   Parte de baixo (mais detalhes): atributos, fraquezas, habilidades
   e dados da espécie.

   APIs usadas aqui:
     /pokemon, /pokemon-species, /evolution-chain, /type, /ability  (PokéAPI)
     MyMemory (tradução das descrições para o português)
   ============================================================ */
Pages.pokemon = (ctx) => {
    const { h, formatName, formatNumber, typeChip, typeColor, typeLabel, rotulo } = UI
    const chave = ctx.args[0] || '' // número ou nome vindo do endereço (#pokemon/25)

    const titulo = h('h1', { class: 'detail-title', tabindex: -1 }, 'Carregando…')
    const corpo = h('div', {}, UI.loading('Carregando dados do Pokémon…'))

    // Cartinha pequena (ícone + nome) usada na fileira de baixo.
    function icone(membro, atualId) {
        return h('li', {},
            h('a', { class: 'dex-card', href: `#pokemon/${membro.id}`, 'aria-current': membro.id === atualId ? 'page' : null },
                h('img', { src: PokeAPI.artwork(membro.id), alt: '', width: 96, height: 96, loading: 'lazy', decoding: 'async' }),
                h('span', { class: 'dex-name' }, formatName(membro.name))))
    }

    async function carregar() {
        try {
            // As três consultas são independentes, então rodam ao mesmo tempo.
            const [pokemon, especie, nomes] = await Promise.all([
                PokeAPI.pokemon(chave),
                PokeAPI.species(chave).catch(() => null), // formas alternativas não têm espécie com o mesmo nome
                PokeAPI.allNames().catch(() => [])
            ])
            if (!ctx.isCurrent()) return

            const nome = formatName(pokemon.name)
            ctx.setTitle(nome)
            titulo.replaceChildren(nome, h('span', { class: 'num' }, formatNumber(pokemon.id)))

            const tipos = pokemon.types.map((entrada) => entrada.type.name)
            const arte = pokemon.sprites.other['official-artwork']
            const arteNormal = arte.front_default || pokemon.sprites.front_default
            const arteBrilhante = arte.front_shiny || null

            /* ---------- Parte de cima: imagem (esquerda) ---------- */
            const imagem = h('img', { src: arteNormal, alt: `Arte oficial de ${nome}`, width: 420, height: 420 })
            const acoes = h('div', { class: 'detail-actions' })

            if (arteBrilhante) {
                // Botão que troca entre a cor normal e a cor "brilhante" (shiny) do Pokémon.
                const botaoBrilho = h('button', {
                    class: 'btn btn-ghost', type: 'button', 'aria-pressed': 'false',
                    onclick: () => {
                        const ligado = botaoBrilho.getAttribute('aria-pressed') !== 'true'
                        botaoBrilho.setAttribute('aria-pressed', String(ligado))
                        imagem.src = ligado ? arteBrilhante : arteNormal
                        imagem.alt = `Arte oficial de ${nome}${ligado ? ' (variante brilhante)' : ''}`
                    }
                }, '✨ Variante brilhante')
                acoes.append(botaoBrilho)
            }

            const botaoFavorito = h('button', {
                class: 'btn btn-ghost', type: 'button', 'aria-pressed': String(Favorites.has(pokemon.id)),
                onclick: () => {
                    const adicionado = Favorites.toggle(pokemon.id)
                    botaoFavorito.setAttribute('aria-pressed', String(adicionado))
                    ctx.announce(adicionado ? `${nome} adicionado aos favoritos.` : `${nome} removido dos favoritos.`)
                }
            }, '★ Favorito')
            acoes.append(botaoFavorito)

            /* ---------- Parte de cima: texto (direita) ---------- */
            // Descrição: a API só tem inglês, então traduzimos com a MyMemory (ver traducao.js).
            const entradas = especie ? especie.flavor_text_entries.filter((e) => e.language.name === 'en') : []
            const textoOriginal = entradas.length ? entradas[entradas.length - 1].flavor_text : ''
            const paragrafoDescricao = h('p', {}, 'Traduzindo a descrição da Pokédex…')
            const notaDescricao = h('small', {}, '')

            if (textoOriginal) {
                Traducao.paraPortugues(textoOriginal).then((resultado) => {
                    if (!ctx.isCurrent()) return
                    paragrafoDescricao.textContent = resultado.texto
                    if (resultado.traduzido) {
                        notaDescricao.textContent = 'Texto da Pokédex com tradução automática.'
                    } else {
                        paragrafoDescricao.setAttribute('lang', 'en')
                        notaDescricao.textContent = 'Não foi possível traduzir agora: texto original em inglês.'
                    }
                })
            }

            const geracaoDados = especie ? GERACOES[especie.generation.name] : null
            const classificacao = !especie ? '—' : especie.is_legendary ? 'Lendário' : especie.is_mythical ? 'Mítico' : especie.is_baby ? 'Bebê' : 'Comum'

            const info = h('div', { class: 'detail-info' },
                h('div', { class: 'chips', 'aria-label': 'Tipos' }, tipos.map((tipo) => typeChip(tipo, { link: true }))),
                textoOriginal && h('blockquote', { class: 'parchment', style: 'margin-inline:0' }, paragrafoDescricao, notaDescricao),
                h('dl', { class: 'facts' },
                    h('div', {}, h('dt', {}, 'Altura'), h('dd', {}, `${(pokemon.height / 10).toLocaleString('pt-BR')} m`)),
                    h('div', {}, h('dt', {}, 'Peso'), h('dd', {}, `${(pokemon.weight / 10).toLocaleString('pt-BR')} kg`)),
                    h('div', {}, h('dt', {}, 'Região'), h('dd', {}, geracaoDados ? `${geracaoDados[1]} (geração ${geracaoDados[0]})` : '—')),
                    h('div', {}, h('dt', {}, 'Classificação'), h('dd', {}, classificacao))))

            /* ---------- Fileira de 3 ícones: evolução ---------- */
            const tituloEvolucao = h('h2', { id: 'titulo-evolucao' }, 'Linha evolutiva')
            const areaEvolucao = h('div', {}, UI.loading('Carregando evolução…'))
            const secaoEvolucao = h('section', { 'aria-labelledby': 'titulo-evolucao' }, tituloEvolucao, areaEvolucao)

            /* ---------- Mais detalhes (abaixo da dobra) ---------- */
            // Atributos de batalha, com barras. 255 é o valor máximo possível de um atributo.
            const total = pokemon.stats.reduce((soma, entrada) => soma + entrada.base_stat, 0)
            const atributos = h('ul', { class: 'stats' }, pokemon.stats.map((entrada) => {
                const valor = entrada.base_stat
                return h('li', { class: 'stat' },
                    h('span', { class: 'stat-name' }, STAT_LABELS[entrada.stat.name] || formatName(entrada.stat.name)),
                    h('span', { class: 'stat-value' }, valor),
                    h('span', { class: 'bar', 'aria-hidden': 'true' }, h('span', { style: `width:${Math.min(100, (valor / 255) * 100)}%` })))
            }))

            const areaFraquezas = h('div', {}, UI.loading('Calculando fraquezas…'))
            const habilidades = h('ul', { class: 'habilidades' }, pokemon.abilities.map((entrada) => {
                const descricao = h('p', {}, 'Carregando descrição…')
                carregarHabilidade(entrada.ability.name, descricao)
                return h('li', {},
                    h('strong', {}, formatName(entrada.ability.name), entrada.is_hidden && ' (oculta)'),
                    descricao)
            }))

            // Dados da espécie (só aparecem se a API tiver a espécie).
            const dadosEspecie = especie && h('dl', { class: 'facts facts-lista' },
                h('div', {}, h('dt', {}, 'Habitat'), h('dd', {}, especie.habitat ? rotulo(HABITATS, especie.habitat.name) : 'Desconhecido')),
                h('div', {}, h('dt', {}, 'Cor'), h('dd', {}, rotulo(CORES, especie.color.name))),
                h('div', {}, h('dt', {}, 'Taxa de captura'), h('dd', {}, `${especie.capture_rate} de 255`)),
                h('div', {}, h('dt', {}, 'Gênero'), h('dd', {}, especie.gender_rate < 0 ? 'Sem gênero' : `${(especie.gender_rate / 8) * 100}% fêmea · ${100 - (especie.gender_rate / 8) * 100}% macho`)),
                h('div', {}, h('dt', {}, 'Grupos de ovos'), h('dd', {}, especie.egg_groups.map((g) => rotulo(GRUPOS_OVO, g.name)).join(', ') || '—')),
                h('div', {}, h('dt', {}, 'Crescimento'), h('dd', {}, rotulo(CRESCIMENTO, especie.growth_rate.name))),
                h('div', {}, h('dt', {}, 'Felicidade base'), h('dd', {}, especie.base_happiness)),
                h('div', {}, h('dt', {}, 'Experiência base'), h('dd', {}, pokemon.base_experience || '—')))

            const maisDetalhes = h('div', { class: 'detail-more' },
                h('section', { 'aria-labelledby': 'titulo-stats' },
                    h('h2', { id: 'titulo-stats' }, 'Atributos base'),
                    atributos,
                    h('p', { class: 'total' }, `Total: ${total}`)),
                h('section', { 'aria-labelledby': 'titulo-fraquezas' },
                    h('h2', { id: 'titulo-fraquezas' }, 'Fraquezas e resistências'),
                    areaFraquezas),
                h('section', { 'aria-labelledby': 'titulo-habilidades' },
                    h('h2', { id: 'titulo-habilidades' }, 'Habilidades'),
                    habilidades,
                    h('p', { class: 'nota' }, 'Os nomes das habilidades ficam no original; as descrições são traduzidas automaticamente.')),
                dadosEspecie && h('section', { 'aria-labelledby': 'titulo-especie' },
                    h('h2', { id: 'titulo-especie' }, 'Sobre a espécie'),
                    dadosEspecie))

            // Anterior / próximo na Pokédex nacional.
            const posicao = nomes.findIndex((item) => item.id === pokemon.id)
            const anterior = posicao > 0 ? nomes[posicao - 1] : null
            const proximo = posicao >= 0 && posicao < nomes.length - 1 ? nomes[posicao + 1] : null
            const navegacao = h('nav', { class: 'pokemon-nav', 'aria-label': 'Navegar entre Pokémon' },
                anterior ? h('a', { class: 'btn btn-ghost', href: `#pokemon/${anterior.id}` }, `‹ ${formatName(anterior.name)}`) : h('span'),
                proximo ? h('a', { class: 'btn btn-ghost', href: `#pokemon/${proximo.id}` }, `${formatName(proximo.name)} ›`) : h('span'))

            // Monta tudo na ordem do esboço: imagem + texto, ícones, e só depois os detalhes.
            corpo.replaceChildren(
                h('div', { class: 'detail-grid', vars: { '--tc': typeColor(tipos[0]) } },
                    h('figure', { class: 'detail-art' }, imagem, acoes),
                    info),
                secaoEvolucao,
                maisDetalhes,
                navegacao)

            // Estas três partes dependem de mais chamadas à API, então chegam depois, sem travar a página.
            carregarEvolucao(especie, pokemon, tipos, tituloEvolucao, areaEvolucao)
            carregarFraquezas(tipos, areaFraquezas)
        } catch (erro) {
            if (!ctx.isCurrent()) return
            if (erro.status !== 404) console.error(erro)
            if (erro.status === 404) {
                titulo.textContent = 'Pokémon não encontrado'
                ctx.setTitle('Pokémon não encontrado')
                corpo.replaceChildren(h('p', {}, `Não existe nenhum Pokémon chamado “${chave}”.`), h('a', { class: 'btn', href: '#pokedex' }, 'Ir para a Pokédex'))
            } else {
                titulo.textContent = 'Pokémon'
                corpo.replaceChildren(UI.errorBox(UI.FRIENDLY_ERROR, ctx.refresh))
            }
        }
    }

    // Evolução: se o Pokémon evolui, mostra a cadeia; se não, mostra 3 Pokémon do mesmo tipo para manter a fileira do esboço.
    async function carregarEvolucao(especie, pokemon, tipos, tituloEl, alvo) {
        try {
            let membros = []
            if (especie) {
                const cadeia = await PokeAPI.evolutionChain(especie.evolution_chain.url)
                membros = PokeAPI.flattenChain(cadeia.chain).flat()
            }
            if (!ctx.isCurrent()) return

            if (membros.length >= 2) {
                alvo.replaceChildren(h('ul', { class: 'evo' }, membros.map((membro) => icone(membro, pokemon.id))))
                return
            }

            tituloEl.textContent = `Outros Pokémon do tipo ${typeLabel(tipos[0])}`
            const doMesmoTipo = (await PokeAPI.typeMembers(tipos[0])).filter((item) => item.id !== pokemon.id)
            if (!ctx.isCurrent()) return
            // O número do Pokémon define de onde começa a escolha, então cada página mostra sugestões diferentes.
            const inicio = pokemon.id % doMesmoTipo.length
            const sugestoes = [0, 1, 2].map((i) => doMesmoTipo[(inicio + i) % doMesmoTipo.length])
            alvo.replaceChildren(
                h('p', {}, `${formatName(pokemon.name)} não evolui. Que tal conhecer estes?`),
                h('ul', { class: 'evo' }, sugestoes.map((membro) => icone(membro, pokemon.id))))
        } catch (erro) {
            console.error(erro)
            if (ctx.isCurrent()) alvo.replaceChildren(UI.errorBox('Não foi possível carregar a linha evolutiva.'))
        }
    }

    // Fraquezas: usa as relações de dano de cada tipo (endpoint /type) e combina os multiplicadores.
    async function carregarFraquezas(tipos, alvo) {
        const GRUPOS = [
            [4, 'Muito fraco (×4)'], [2, 'Fraco (×2)'], [0.5, 'Resiste (×½)'], [0.25, 'Resiste muito (×¼)'], [0, 'Imune (×0)']
        ]
        try {
            const multiplicadores = await PokeAPI.weaknesses(tipos)
            if (!ctx.isCurrent()) return
            const linhas = GRUPOS.map(([valor, rotuloGrupo]) => {
                const doGrupo = Object.keys(multiplicadores).filter((tipo) => multiplicadores[tipo] === valor && TYPE_INFO[tipo])
                if (doGrupo.length === 0) return null
                return h('div', { class: 'efeito' }, h('h3', {}, rotuloGrupo), h('div', { class: 'chips' }, doGrupo.map((tipo) => typeChip(tipo, { link: true }))))
            })
            alvo.replaceChildren(...linhas.filter(Boolean))
        } catch (erro) {
            console.error(erro)
            if (ctx.isCurrent()) alvo.replaceChildren(UI.errorBox('Não foi possível calcular as fraquezas.'))
        }
    }

    // Habilidade: busca a descrição curta na API e traduz.
    async function carregarHabilidade(nome, alvo) {
        try {
            const dados = await PokeAPI.ability(nome)
            const entrada = dados.effect_entries.find((e) => e.language.name === 'en')
            const original = entrada ? entrada.short_effect.replace(/\$effect_chance%?/g, 'uma certa chance de') : ''
            if (!original) { alvo.textContent = 'Sem descrição disponível.'; return }
            const resultado = await Traducao.paraPortugues(original)
            if (!ctx.isCurrent()) return
            alvo.textContent = resultado.traduzido ? resultado.texto : `${resultado.texto} (original em inglês)`
            if (!resultado.traduzido) alvo.setAttribute('lang', 'en')
        } catch (erro) {
            console.error(erro)
            if (ctx.isCurrent()) alvo.textContent = 'Não foi possível carregar a descrição.'
        }
    }

    carregar()

    return {
        title: 'Pokémon',
        node: h('article', { class: 'page page-detail' },
            h('a', { class: 'back-link', href: '#pokedex' }, '‹ Voltar à Pokédex'),
            titulo,
            corpo)
    }
}

// #aleatorio: sorteia um Pokémon e leva direto para a página dele.
Pages.aleatorio = (ctx) => {
    PokeAPI.allNames()
        .then((nomes) => nomes[Math.floor(Math.random() * nomes.length)].id)
        .catch(() => Math.floor(Math.random() * 1025) + 1) // se a API falhar, sorteia entre os 1025 conhecidos
        .then((id) => { if (ctx.isCurrent()) window.location.replace(`#pokemon/${id}`) })

    return {
        title: 'Pokémon aleatório',
        node: UI.h('article', { class: 'page' },
            UI.h('h1', { class: 'sr-only', tabindex: -1 }, 'Pokémon aleatório'),
            UI.loading('Sorteando um Pokémon…'))
    }
}
