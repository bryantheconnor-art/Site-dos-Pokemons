'use strict'

/* ============================================================
   api.js — acesso à PokéAPI (https://pokeapi.co/docs/v2)
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Aqui ficam TODAS as chamadas à API. As páginas nunca usam
   fetch direto: elas pedem os dados para este arquivo.
   Duas ideias importantes:
     1) cache em memória -> o mesmo endereço não é pedido duas vezes;
     2) a lista de nomes fica no sessionStorage, porque ela é grande
        e quase nunca muda.
   ============================================================ */
const PokeAPI = (() => {
    const BASE = 'https://pokeapi.co/api/v2'
    const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
    const NAMES_KEY = 'atlas-pokemon:nomes:v1'
    const memoria = new Map() // guarda as promessas já feitas: endereço -> promessa

    // GET genérico com cache. Se der erro, a entrada é apagada para poder tentar de novo.
    function get(caminho) {
        const url = caminho.startsWith('http') ? caminho : `${BASE}${caminho}`
        if (memoria.has(url)) return memoria.get(url)

        const pedido = fetch(url).then((resposta) => {
            if (!resposta.ok) {
                const erro = new Error(`A PokéAPI respondeu com status ${resposta.status}`)
                erro.status = resposta.status
                throw erro
            }
            return resposta.json()
        })

        memoria.set(url, pedido)
        pedido.catch(() => memoria.delete(url))
        return pedido
    }

    // A API devolve endereços como ".../pokemon/25/". Esta função pega só o número (25).
    function idFromUrl(url) {
        return Number(url.split('/').filter(Boolean).pop())
    }

    // As imagens oficiais seguem um padrão fixo de endereço, então dá para montar sem pedir nada.
    function artwork(id, brilhante = false) {
        return `${SPRITES}/other/official-artwork/${brilhante ? 'shiny/' : ''}${id}.png`
    }

    // Lista [{ id, name }] de todas as espécies. Ignora formas alternativas (id >= 10000).
    async function allNames() {
        try {
            const salvo = JSON.parse(sessionStorage.getItem(NAMES_KEY))
            if (Array.isArray(salvo) && salvo.length) return salvo
        } catch (erro) { /* sem sessionStorage: segue sem cache */ }

        const dados = await get('/pokemon?limit=100000')
        const lista = dados.results
            .map((item) => ({ id: idFromUrl(item.url), name: item.name }))
            .filter((item) => item.id < 10000)
            .sort((a, b) => a.id - b.id)

        try { sessionStorage.setItem(NAMES_KEY, JSON.stringify(lista)) } catch (erro) { /* ignora */ }
        return lista
    }

    // Dados completos de um tipo (inclui as relações de dano e a lista de Pokémon).
    const tipo = (nome) => get(`/type/${encodeURIComponent(nome)}`)

    // Pokémon que pertencem a um tipo.
    async function typeMembers(nome) {
        const dados = await tipo(nome)
        return dados.pokemon
            .map((item) => ({ id: idFromUrl(item.pokemon.url), name: item.pokemon.name }))
            .filter((item) => item.id < 10000)
            .sort((a, b) => a.id - b.id)
    }

    // Espécies de uma geração (1 = Kanto, 2 = Johto...). Usado no filtro por região.
    async function generationMembers(numero) {
        const dados = await get(`/generation/${numero}`)
        return dados.pokemon_species
            .map((item) => ({ id: idFromUrl(item.url), name: item.name }))
            .sort((a, b) => a.id - b.id)
    }

    // Calcula a "tabela de efetividade" de um Pokémon: quanto de dano cada tipo causa nele.
    // Para dois tipos os multiplicadores se multiplicam (ex.: ×2 · ×2 = ×4).
    async function weaknesses(tiposDoPokemon) {
        const dados = await Promise.all(tiposDoPokemon.map(tipo))
        const mult = {}
        const aplicar = (lista, fator) => lista.forEach((t) => { mult[t.name] = (mult[t.name] === undefined ? 1 : mult[t.name]) * fator })

        dados.forEach((d) => {
            aplicar(d.damage_relations.double_damage_from, 2)
            aplicar(d.damage_relations.half_damage_from, 0.5)
            aplicar(d.damage_relations.no_damage_from, 0)
        })
        return mult // ex.: { fire: 2, water: 0.5, electric: 0 }
    }

    // Transforma a árvore de evolução em etapas: [[etapa 1], [etapa 2], ...].
    function flattenChain(no, nivel = 0, etapas = []) {
        (etapas[nivel] = etapas[nivel] || []).push({ id: idFromUrl(no.species.url), name: no.species.name })
        no.evolves_to.forEach((proximo) => flattenChain(proximo, nivel + 1, etapas))
        return etapas
    }

    return {
        get,
        idFromUrl,
        artwork,
        allNames,
        typeMembers,
        generationMembers,
        weaknesses,
        flattenChain,
        pokemon: (idOuNome) => get(`/pokemon/${encodeURIComponent(String(idOuNome).toLowerCase())}`),
        species: (idOuNome) => get(`/pokemon-species/${encodeURIComponent(String(idOuNome).toLowerCase())}`),
        ability: (nome) => get(`/ability/${encodeURIComponent(nome)}`),
        evolutionChain: (url) => get(url),
        async speciesCount() {
            return (await get('/pokemon-species?limit=1')).count
        },
        async types() {
            const dados = await get('/type')
            // "unknown" e "shadow" não são tipos de verdade (ids acima de 10000).
            return dados.results
                .map((item) => ({ id: idFromUrl(item.url), name: item.name }))
                .filter((item) => item.id < 10000)
        }
    }
})()
