'use strict'

// Cliente da PokéAPI (https://pokeapi.co/docs/v2).
// Mantém um cache em memória (por promessa) para evitar chamadas repetidas
// e guarda a lista de nomes em sessionStorage, pois ela raramente muda.
const PokeAPI = (() => {
    const BASE = 'https://pokeapi.co/api/v2'
    const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
    const NAMES_KEY = 'atlas-pokemon:nomes:v1'
    const memory = new Map()

    // GET com cache. Em caso de erro a entrada é descartada para permitir nova tentativa.
    function get(path) {
        const url = path.startsWith('http') ? path : `${BASE}${path}`
        if (memory.has(url)) return memory.get(url)

        const request = fetch(url).then((response) => {
            if (!response.ok) {
                const error = new Error(`A PokéAPI respondeu com status ${response.status}`)
                error.status = response.status
                throw error
            }
            return response.json()
        })

        memory.set(url, request)
        request.catch(() => memory.delete(url))
        return request
    }

    // Extrai o número da espécie a partir de uma URL da API (…/pokemon/25/).
    function idFromUrl(url) {
        return Number(url.split('/').filter(Boolean).pop())
    }

    // Imagens oficiais seguem um padrão previsível de URL.
    function artwork(id, shiny = false) {
        return `${SPRITES}/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`
    }

    // Lista completa [{ id, name }] das espécies (ignora formas alternativas, id >= 10000).
    async function allNames() {
        try {
            const saved = JSON.parse(sessionStorage.getItem(NAMES_KEY))
            if (Array.isArray(saved) && saved.length) return saved
        } catch (error) { /* sessionStorage indisponível: segue sem cache */ }

        const data = await get('/pokemon?limit=100000')
        const list = data.results
            .map((item) => ({ id: idFromUrl(item.url), name: item.name }))
            .filter((item) => item.id < 10000)
            .sort((a, b) => a.id - b.id)

        try { sessionStorage.setItem(NAMES_KEY, JSON.stringify(list)) } catch (error) { /* ignora */ }
        return list
    }

    return {
        get,
        idFromUrl,
        artwork,
        allNames,
        pokemon: (idOrName) => get(`/pokemon/${encodeURIComponent(String(idOrName).toLowerCase())}`),
        species: (idOrName) => get(`/pokemon-species/${encodeURIComponent(String(idOrName).toLowerCase())}`),
        evolutionChain: (url) => get(url),
        async speciesCount() {
            return (await get('/pokemon-species?limit=1')).count
        },
        async types() {
            const data = await get('/type')
            // "unknown" e "shadow" não são tipos jogáveis (ids acima de 10000).
            return data.results
                .map((item) => ({ id: idFromUrl(item.url), name: item.name }))
                .filter((item) => item.id < 10000)
        },
        async typeMembers(type) {
            const data = await get(`/type/${encodeURIComponent(type)}`)
            return data.pokemon
                .map((item) => ({ id: idFromUrl(item.pokemon.url), name: item.pokemon.name }))
                .filter((item) => item.id < 10000)
                .sort((a, b) => a.id - b.id)
        },
        // Converte a árvore de evolução em etapas: [[espécies da etapa 1], [etapa 2], …].
        flattenChain(node, depth = 0, stages = []) {
            (stages[depth] = stages[depth] || []).push({ id: idFromUrl(node.species.url), name: node.species.name })
            node.evolves_to.forEach((next) => PokeAPI.flattenChain(next, depth + 1, stages))
            return stages
        }
    }
})()
