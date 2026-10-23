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
            h('h1', { id: 'titulo-inicio', class: 'home-title', tabindex: -1 },
                h('img', { src: 'assets/pokebola.svg', alt: '', 'aria-hidden': 'true', width: 64, height: 64 }),
                SITE.nome),
            h('div', { class: 'ornament', 'aria-hidden': 'true' }, h('span')),
            h('p', { class: 'lead' }, 'Conheça criaturas, tipos e linhas evolutivas com dados ao vivo da PokéAPI, tudo em português.'),
            h('p', { class: 'home-author' },
                'Criado por ',
                h('a', { href: SITE.autorUrl, target: '_blank', rel: 'noopener noreferrer' }, SITE.autor),
                ' · ',
                h('a', { href: SITE.autorUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Meu GitHub')),
            h('form', {
                class: 'home-search',
                role: 'search',
                onsubmit: (evento) => {
                    evento.preventDefault()
                    const termo = new FormData(evento.currentTarget).get('busca').trim()
                    if (termo) window.location.hash = `#pokedex?busca=${encodeURIComponent(termo)}`
                }
            },
                h('label', { class: 'sr-only', for: 'busca-inicio' }, 'Buscar Pokémon por nome ou número'),
                h('input', { id: 'busca-inicio', name: 'busca', type: 'search', placeholder: 'Buscar Pokémon por nome ou número', autocomplete: 'off', required: true }),
                h('button', { class: 'btn', type: 'submit' },
                    h('img', { class: 'search-icon', src: 'assets/pokebola.svg', alt: '', 'aria-hidden': 'true', width: 19, height: 19 }),
                    'Buscar')),
            h('div', { class: 'banner-actions' },
                h('a', { class: 'btn', href: '#pokedex' }, 'Explorar a Pokédex'),
                h('a', { class: 'btn btn-ghost', href: '#aleatorio' }, 'Pokémon aleatório'))),
        h('div', { class: 'banner-art', role: 'img', 'aria-label': descricaoMontagem }, imagens))

    const imagemDestaque = h('img', {
        class: 'showcase-pokemon',
        src: PokeAPI.artwork(25),
        alt: 'Pikachu em destaque',
        width: 100,
        height: 100
    })
    const botaoAnimacao = h('button', {
        class: 'btn btn-ghost',
        type: 'button',
        'aria-pressed': 'false',
        onclick: (evento) => {
            const pausado = imagemDestaque.classList.toggle('is-paused')
            evento.currentTarget.textContent = pausado ? 'Retomar animação' : 'Pausar animação'
            evento.currentTarget.setAttribute('aria-pressed', String(pausado))
        }
    }, 'Pausar animação')

    const botaoPokebola = h('button', {
        class: 'pokeball-toggle',
        type: 'button',
        'aria-label': 'Girar a Pokébola',
        'aria-pressed': 'false',
        onclick: (evento) => {
            const botao = evento.currentTarget
            botao.classList.remove('is-spinning')
            void botao.offsetWidth
            botao.classList.add('is-spinning')
            botao.setAttribute('aria-pressed', 'true')
        },
        onanimationend: (evento) => {
            if (evento.animationName === 'pokeball-spin') {
                evento.currentTarget.classList.remove('is-spinning')
                evento.currentTarget.setAttribute('aria-pressed', 'false')
            }
        }
    },
        h('img', { src: 'assets/pokebola.svg', alt: '', 'aria-hidden': 'true', width: 60, height: 60 }),
        h('span', { class: 'sr-only' }, 'Girar a Pokébola'))

    const perfilGitHub = h('div', { class: 'github-profile', role: 'status', 'aria-live': 'polite' },
        h('p', {}, 'Carregando perfil do GitHub…'))
    const cartaoGitHub = h('section', { class: 'showcase-card github-card', 'aria-label': 'Perfil do GitHub' },
        h('h3', {}, 'Meu GitHub'),
        perfilGitHub)

    async function carregarPerfilGitHub() {
        try {
            const resposta = await fetch(`https://api.github.com/users/${encodeURIComponent(SITE.autor)}`, {
                headers: { Accept: 'application/vnd.github+json' }
            })
            if (!resposta.ok) throw new Error(`GitHub API respondeu com HTTP ${resposta.status}`)
            const perfil = await resposta.json()
            if (!perfil || typeof perfil.login !== 'string' || typeof perfil.avatar_url !== 'string') {
                throw new Error('A resposta do perfil do GitHub está incompleta.')
            }
            perfilGitHub.replaceChildren(
                h('img', { class: 'github-avatar', src: perfil.avatar_url, alt: `Avatar de ${perfil.login}`, width: 56, height: 56 }),
                h('div', {},
                    h('p', {}, perfil.name || perfil.login),
                    h('a', { href: SITE.autorUrl, target: '_blank', rel: 'noopener noreferrer' }, `@${perfil.login}`),
                    h('p', { class: 'github-stats' }, `${perfil.public_repos} repositórios · ${perfil.followers} ${perfil.followers === 1 ? 'seguidor' : 'seguidores'}`)))
        } catch (erro) {
            console.error('Não foi possível carregar o perfil do GitHub.', erro)
            perfilGitHub.replaceChildren(
                h('p', { class: 'github-error' }, 'Não foi possível carregar os dados do GitHub agora.'),
                h('button', { class: 'btn btn-ghost', type: 'button', onclick: carregarPerfilGitHub }, 'Tentar novamente'))
        }
    }
    carregarPerfilGitHub()

    const destaques = h('div', { class: 'interactive-showcase' },
        h('section', { class: 'showcase-card', 'aria-label': 'Pokémon animado' },
            imagemDestaque,
            h('p', {}, 'Pikachu em destaque'),
            botaoAnimacao),
        cartaoGitHub,
        h('section', { class: 'showcase-card', 'aria-label': 'Pokébola interativa' },
            botaoPokebola,
            h('p', {}, 'Clique na Pokébola para girar')))

    const apis = h('section', { class: 'api-highlights', 'aria-labelledby': 'apis-utilizadas' },
        h('h2', { id: 'apis-utilizadas' }, 'APIs utilizadas'),
        h('ul', {},
            h('li', {},
                h('a', { href: 'https://pokeapi.co/', target: '_blank', rel: 'noopener noreferrer' }, 'PokéAPI'),
                h('p', {}, 'Dados, espécies, tipos, evoluções e imagens de Pokémon.')),
            h('li', {},
                h('a', { href: 'https://mymemory.translated.net/', target: '_blank', rel: 'noopener noreferrer' }, 'MyMemory Translation API'),
                h('p', {}, 'Tradução automática das descrições para português.')),
            h('li', {},
                h('a', { href: 'https://docs.github.com/en/rest/users/users', target: '_blank', rel: 'noopener noreferrer' }, 'GitHub REST API'),
                h('p', {}, 'Carrega os dados públicos do perfil do autor.'))))

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
        cartao({ href: '#sobre', id: 479, nome: 'Rotom', titulo: `Sobre a ${SITE.nome}`, texto: 'Conheça o projeto, as APIs por trás dele, o autor e o esboço que o originou.', cor: typeColor('ghost') }))

    return {
        title: SITE.nome,
        node: h('article', { class: 'page' },
            banner,
            destaques,
            apis,
            h('section', { 'aria-labelledby': 'por-onde-comecar' },
                h('h2', { id: 'por-onde-comecar' }, 'Por onde começar?'),
                grade))
    }
}
