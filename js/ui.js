'use strict'

/* ============================================================
   ui.js — ferramentas de interface e tabelas em português
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Contém:
     - Pages: onde cada página se registra;
     - tabelas de tradução (tipos, regiões, habitats...), já que
       a PokéAPI não oferece esses nomes em português;
     - UI.h(): função que cria elementos HTML com segurança;
     - Favorites: favoritos salvos no navegador.
   ============================================================ */

// Cada arquivo de js/pages/ adiciona a sua página aqui (Pages.home, Pages.pokedex...).
const Pages = {}

// Tipos: [nome em português, cor do tipo].
const TYPE_INFO = {
    normal: ['Normal', '#a8a77a'], fire: ['Fogo', '#ee8130'], water: ['Água', '#6390f0'],
    electric: ['Elétrico', '#f7d02c'], grass: ['Planta', '#7ac74c'], ice: ['Gelo', '#96d9d6'],
    fighting: ['Lutador', '#c22e28'], poison: ['Veneno', '#a33ea1'], ground: ['Terrestre', '#e2bf65'],
    flying: ['Voador', '#a98ff3'], psychic: ['Psíquico', '#f95587'], bug: ['Inseto', '#a6b91a'],
    rock: ['Pedra', '#b6a136'], ghost: ['Fantasma', '#735797'], dragon: ['Dragão', '#6f35fc'],
    dark: ['Sombrio', '#705746'], steel: ['Aço', '#b7b7ce'], fairy: ['Fada', '#d685ad']
}

// Nomes dos atributos de batalha.
const STAT_LABELS = {
    hp: 'PS', attack: 'Ataque', defense: 'Defesa',
    'special-attack': 'Atq. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidade'
}

// Gerações da API -> [número romano, região], na ordem em que foram lançadas.
const GERACOES = {
    'generation-i': ['I', 'Kanto'], 'generation-ii': ['II', 'Johto'], 'generation-iii': ['III', 'Hoenn'],
    'generation-iv': ['IV', 'Sinnoh'], 'generation-v': ['V', 'Unova'], 'generation-vi': ['VI', 'Kalos'],
    'generation-vii': ['VII', 'Alola'], 'generation-viii': ['VIII', 'Galar'], 'generation-ix': ['IX', 'Paldea']
}

const HABITATS = {
    cave: 'Caverna', forest: 'Floresta', grassland: 'Campo aberto', mountain: 'Montanha', rare: 'Raro',
    'rough-terrain': 'Terreno acidentado', sea: 'Mar', urban: 'Cidade', 'waters-edge': 'Beira d’água'
}

const CORES = {
    black: 'Preto', blue: 'Azul', brown: 'Marrom', gray: 'Cinza', green: 'Verde',
    pink: 'Rosa', purple: 'Roxo', red: 'Vermelho', white: 'Branco', yellow: 'Amarelo'
}

const GRUPOS_OVO = {
    monster: 'Monstro', water1: 'Água 1', water2: 'Água 2', water3: 'Água 3', bug: 'Inseto', flying: 'Voador',
    ground: 'Campo', fairy: 'Fada', plant: 'Planta', humanshape: 'Humanoide', mineral: 'Mineral',
    indeterminate: 'Amorfo', ditto: 'Ditto', dragon: 'Dragão', 'no-eggs': 'Não bota ovos'
}

const CRESCIMENTO = {
    slow: 'Lento', medium: 'Médio', fast: 'Rápido', 'medium-slow': 'Médio-lento',
    'slow-then-very-fast': 'Errático', 'fast-then-very-slow': 'Flutuante'
}

const UI = (() => {
    /* h(tag, propriedades, ...filhos) cria um elemento HTML.
       Exemplo: h('a', { href: '#home', class: 'btn' }, 'Início')
       Usamos isto no lugar de innerHTML: o texto vindo da API entra sempre
       como texto puro, então não existe risco de injetar código na página. */
    function h(tag, props = {}, ...filhos) {
        const elemento = document.createElement(tag)

        for (const [chave, valor] of Object.entries(props || {})) {
            if (valor === null || valor === undefined || valor === false) continue
            if (chave === 'class') elemento.className = valor
            else if (chave === 'vars') Object.entries(valor).forEach(([nome, v]) => elemento.style.setProperty(nome, v)) // variáveis CSS
            else if (chave.startsWith('on')) elemento.addEventListener(chave.slice(2).toLowerCase(), valor) // onclick, onsubmit...
            else elemento.setAttribute(chave, valor === true ? '' : valor)
        }

        // Aceita texto, elementos, listas de elementos e ignora vazios.
        const anexar = (filho) => {
            if (filho === null || filho === undefined || filho === false) return
            if (Array.isArray(filho)) filho.forEach(anexar)
            else elemento.append(filho instanceof Node ? filho : document.createTextNode(String(filho)))
        }
        filhos.forEach(anexar)
        return elemento
    }

    const capitalize = (palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1)
    const formatName = (nome) => nome.split('-').map(capitalize).join(' ') // "mr-mime" -> "Mr Mime"
    const formatNumber = (id) => `#${String(id).padStart(4, '0')}` // 25 -> "#0025"

    // Procura um valor traduzido numa tabela; se não achar, mostra o nome original formatado.
    const rotulo = (tabela, chave) => tabela[chave] || formatName(chave)

    function typeColor(tipo) {
        return (TYPE_INFO[tipo] || [tipo, '#e8c26a'])[1]
    }

    function typeLabel(tipo) {
        return (TYPE_INFO[tipo] || [formatName(tipo)])[0]
    }

    // Escolhe preto ou branco para o texto, conforme o contraste com a cor de fundo (regra WCAG).
    function readableTextOn(hex) {
        const canal = (inicio) => {
            const valor = parseInt(hex.slice(inicio, inicio + 2), 16) / 255
            return valor <= 0.03928 ? valor / 12.92 : ((valor + 0.055) / 1.055) ** 2.4
        }
        const luminancia = 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5)
        const contraPreto = (luminancia + 0.05) / 0.05
        const contraBranco = 1.05 / (luminancia + 0.05)
        return contraPreto >= contraBranco ? '#10121f' : '#ffffff'
    }

    // Selo colorido com o nome do tipo. O texto garante que a cor nunca é a única informação.
    function typeChip(tipo, { link = false, extra = '' } = {}) {
        const cor = typeColor(tipo)
        const props = {
            class: 'type-chip',
            vars: { '--chip': cor, '--chip-text': readableTextOn(cor) }
        }
        const texto = typeLabel(tipo) + extra
        return link
            ? h('a', { ...props, href: `#pokedex?tipo=${encodeURIComponent(tipo)}` }, texto)
            : h('span', props, texto)
    }

    // Aviso de "carregando" (role="status" faz o leitor de tela anunciar).
    function loading(mensagem) {
        return h('div', { class: 'status', role: 'status' },
            h('span', { class: 'spinner', 'aria-hidden': 'true' }),
            h('span', {}, mensagem))
    }

    // Caixa de erro com botão para tentar de novo.
    function errorBox(mensagem, aoTentar) {
        return h('div', { class: 'status status-error', role: 'alert' },
            h('p', {}, mensagem),
            aoTentar && h('button', { class: 'btn', type: 'button', onclick: aoTentar }, 'Tentar novamente'))
    }

    const FRIENDLY_ERROR = 'Não foi possível carregar os dados da PokéAPI. Verifique sua conexão e tente novamente.'

    // Escolhe a melhor imagem disponível do Pokémon.
    function artworkOf(pokemon) {
        const arte = pokemon.sprites && pokemon.sprites.other && pokemon.sprites.other['official-artwork']
        return (arte && arte.front_default) || (pokemon.sprites && pokemon.sprites.front_default) || PokeAPI.artwork(pokemon.id)
    }

    // Cartão pequeno usado na grade 3 × 4 da Pokédex (tela 2 do esboço).
    function pokemonCard(pokemon) {
        const tipos = (pokemon.types || []).map((entrada) => entrada.type.name)
        const cor = typeColor(tipos[0] || '')
        return h('li', { class: 'dex-item' },
            h('a', { class: 'dex-card', href: `#pokemon/${pokemon.id}`, vars: { '--tc': cor } },
                h('span', { class: 'dex-num' }, formatNumber(pokemon.id)),
                h('img', { src: artworkOf(pokemon), alt: '', width: 120, height: 120, loading: 'lazy', decoding: 'async' }),
                h('span', { class: 'dex-name' }, formatName(pokemon.name)),
                tipos.length > 0 && h('span', { class: 'sr-only' }, `Tipo: ${tipos.map(typeLabel).join(', ')}`)))
    }

    return {
        h, capitalize, formatName, formatNumber, rotulo, typeColor, typeLabel, readableTextOn,
        typeChip, loading, errorBox, FRIENDLY_ERROR, artworkOf, pokemonCard
    }
})()

/* Favoritos: ficam guardados no localStorage do navegador.
   Se o navegador bloquear o armazenamento, usamos uma cópia em memória. */
const Favorites = (() => {
    const CHAVE = 'atlas-pokemon:favoritos'
    let memoria = []

    function list() {
        try {
            const salvo = JSON.parse(localStorage.getItem(CHAVE))
            if (Array.isArray(salvo)) memoria = salvo.filter(Number.isInteger)
        } catch (erro) { /* usa a cópia em memória */ }
        return [...memoria]
    }

    function save(ids) {
        memoria = ids
        try { localStorage.setItem(CHAVE, JSON.stringify(ids)) } catch (erro) { /* ignora */ }
    }

    const has = (id) => list().includes(id)

    // Liga/desliga o favorito. Retorna true se o Pokémon passou a ser favorito.
    function toggle(id) {
        const ids = list()
        const existe = ids.includes(id)
        save(existe ? ids.filter((item) => item !== id) : [...ids, id].sort((a, b) => a - b))
        return !existe
    }

    return { list, has, toggle }
})()
