'use strict'

// Registro das páginas; cada arquivo em js/pages/ adiciona a sua.
const Pages = {}

// Tipos: [nome em português, cor]. A PokéAPI não traz os nomes em português.
const TYPE_INFO = {
    normal: ['Normal', '#a8a77a'], fire: ['Fogo', '#ee8130'], water: ['Água', '#6390f0'],
    electric: ['Elétrico', '#f7d02c'], grass: ['Planta', '#7ac74c'], ice: ['Gelo', '#96d9d6'],
    fighting: ['Lutador', '#c22e28'], poison: ['Veneno', '#a33ea1'], ground: ['Terrestre', '#e2bf65'],
    flying: ['Voador', '#a98ff3'], psychic: ['Psíquico', '#f95587'], bug: ['Inseto', '#a6b91a'],
    rock: ['Pedra', '#b6a136'], ghost: ['Fantasma', '#735797'], dragon: ['Dragão', '#6f35fc'],
    dark: ['Sombrio', '#705746'], steel: ['Aço', '#b7b7ce'], fairy: ['Fada', '#d685ad']
}

const STAT_LABELS = {
    hp: 'PS', attack: 'Ataque', defense: 'Defesa',
    'special-attack': 'Atq. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidade'
}

const UI = (() => {
    // Cria elementos sem usar innerHTML: dados vindos da API entram sempre como texto.
    function h(tag, props = {}, ...children) {
        const element = document.createElement(tag)

        for (const [key, value] of Object.entries(props || {})) {
            if (value === null || value === undefined || value === false) continue
            if (key === 'class') element.className = value
            else if (key === 'vars') Object.entries(value).forEach(([name, v]) => element.style.setProperty(name, v))
            else if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), value)
            else element.setAttribute(key, value === true ? '' : value)
        }

        const append = (child) => {
            if (child === null || child === undefined || child === false) return
            if (Array.isArray(child)) child.forEach(append)
            else element.append(child instanceof Node ? child : document.createTextNode(String(child)))
        }
        children.forEach(append)
        return element
    }

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)
    const formatName = (name) => name.split('-').map(capitalize).join(' ')
    const formatNumber = (id) => `#${String(id).padStart(4, '0')}`

    function typeColor(type) {
        return (TYPE_INFO[type] || [type, '#e8c26a'])[1]
    }

    function typeLabel(type) {
        return (TYPE_INFO[type] || [formatName(type)])[0]
    }

    // Escolhe preto ou branco, o que tiver maior contraste com a cor de fundo (WCAG).
    function readableTextOn(hex) {
        const channel = (start) => {
            const value = parseInt(hex.slice(start, start + 2), 16) / 255
            return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        }
        const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
        const againstBlack = (luminance + 0.05) / 0.05
        const againstWhite = 1.05 / (luminance + 0.05)
        return againstBlack >= againstWhite ? '#10121f' : '#ffffff'
    }

    // Selo com o nome do tipo (o texto garante que a cor nunca é a única informação).
    function typeChip(type, { link = false } = {}) {
        const color = typeColor(type)
        const props = {
            class: 'type-chip',
            vars: { '--chip': color, '--chip-text': readableTextOn(color) }
        }
        return link
            ? h('a', { ...props, href: `#pokedex?tipo=${encodeURIComponent(type)}` }, typeLabel(type))
            : h('span', props, typeLabel(type))
    }

    function loading(message) {
        return h('div', { class: 'status', role: 'status' },
            h('span', { class: 'spinner', 'aria-hidden': 'true' }),
            h('span', {}, message))
    }

    function errorBox(message, onRetry) {
        return h('div', { class: 'status status-error', role: 'alert' },
            h('p', {}, message),
            onRetry && h('button', { class: 'btn', type: 'button', onclick: onRetry }, 'Tentar novamente'))
    }

    const FRIENDLY_ERROR = 'Não foi possível carregar os dados da PokéAPI. Verifique sua conexão e tente novamente.'

    function artworkOf(pokemon) {
        const art = pokemon.sprites && pokemon.sprites.other && pokemon.sprites.other['official-artwork']
        return (art && art.front_default) || (pokemon.sprites && pokemon.sprites.front_default) || PokeAPI.artwork(pokemon.id)
    }

    // Cartão da Pokédex (grade 3 × 4 do esboço).
    function pokemonCard(pokemon) {
        const types = (pokemon.types || []).map((entry) => entry.type.name)
        const color = typeColor(types[0] || '')
        return h('li', { class: 'dex-item' },
            h('a', { class: 'dex-card', href: `#pokemon/${pokemon.id}`, vars: { '--tc': color } },
                h('span', { class: 'dex-num' }, formatNumber(pokemon.id)),
                h('img', { src: artworkOf(pokemon), alt: '', width: 120, height: 120, loading: 'lazy', decoding: 'async' }),
                h('span', { class: 'dex-name' }, formatName(pokemon.name)),
                types.length > 0 && h('span', { class: 'sr-only' }, `Tipo: ${types.map(typeLabel).join(', ')}`)))
    }

    return { h, capitalize, formatName, formatNumber, typeColor, typeLabel, typeChip, loading, errorBox, FRIENDLY_ERROR, artworkOf, pokemonCard }
})()

// Favoritos guardados no navegador (com cópia em memória se o armazenamento falhar).
const Favorites = (() => {
    const KEY = 'atlas-pokemon:favoritos'
    let memory = []

    function list() {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY))
            if (Array.isArray(saved)) memory = saved.filter(Number.isInteger)
        } catch (error) { /* usa a cópia em memória */ }
        return [...memory]
    }

    function save(ids) {
        memory = ids
        try { localStorage.setItem(KEY, JSON.stringify(ids)) } catch (error) { /* ignora */ }
    }

    const has = (id) => list().includes(id)

    // Retorna true se o Pokémon passou a ser favorito.
    function toggle(id) {
        const ids = list()
        const exists = ids.includes(id)
        save(exists ? ids.filter((item) => item !== id) : [...ids, id].sort((a, b) => a - b))
        return !exists
    }

    return { list, has, toggle }
})()
