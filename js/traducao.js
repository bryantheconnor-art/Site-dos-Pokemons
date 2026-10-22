'use strict'

/* ============================================================
   traducao.js — tradução automática para o português
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   A PokéAPI não tem textos em português (só inglês, espanhol,
   francês, japonês etc.). Por isso este arquivo usa uma SEGUNDA
   API pública, a MyMemory (https://mymemory.translated.net),
   para traduzir as descrições do inglês para o português do Brasil.

   Regras para não depender demais dela:
     - cada texto traduzido fica salvo no navegador (localStorage);
     - se a tradução falhar (internet, limite diário), o texto original
       aparece e a página avisa que está em inglês.
   ============================================================ */
const Traducao = (() => {
    const PREFIXO = 'atlas-pokemon:traducao:v1:'
    const TEMPO_LIMITE = 8000 // ms
    const memoria = new Map()

    // Cria uma chave curta a partir do texto (algoritmo djb2) para usar no localStorage.
    function chave(texto) {
        let hash = 5381
        for (let i = 0; i < texto.length; i++) hash = ((hash << 5) + hash + texto.charCodeAt(i)) >>> 0
        return PREFIXO + hash.toString(36)
    }

    // Arruma o texto antes de enviar: a Pokédex usa quebras de linha, hífen invisível e "POKéMON" em maiúsculas.
    function limpar(texto) {
        return texto
            .replace(/[\n\f\r]+/g, ' ')
            .replace(/­/g, '')
            .replace(/POKéMON/g, 'Pokémon')
            .replace(/\s+/g, ' ')
            .trim()
    }

    // A API às vezes devolve entidades HTML (&#39;). O DOMParser converte para texto comum sem executar nada.
    function decodificar(texto) {
        return new DOMParser().parseFromString(texto, 'text/html').body.textContent
    }

    // Retorna { texto, traduzido }. Nunca lança erro: no pior caso devolve o original.
    async function paraPortugues(original) {
        const limpo = limpar(original)
        if (!limpo) return { texto: '', traduzido: false }
        if (memoria.has(limpo)) return memoria.get(limpo)

        const guardada = (() => { try { return localStorage.getItem(chave(limpo)) } catch (erro) { return null } })()
        if (guardada) {
            const resultado = { texto: guardada, traduzido: true }
            memoria.set(limpo, resultado)
            return resultado
        }

        const controle = new AbortController()
        const relogio = window.setTimeout(() => controle.abort(), TEMPO_LIMITE)
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(limpo)}&langpair=en|pt-BR`
            const resposta = await fetch(url, { signal: controle.signal })
            const dados = await resposta.json()
            const traduzido = dados && dados.responseData && dados.responseData.translatedText

            // Quando o limite diário acaba, a API devolve um aviso no lugar da tradução.
            if (Number(dados.responseStatus) !== 200 || !traduzido || /MYMEMORY WARNING|INVALID/i.test(traduzido)) {
                throw new Error('Tradução indisponível')
            }

            const texto = decodificar(traduzido)
            try { localStorage.setItem(chave(limpo), texto) } catch (erro) { /* ignora */ }
            const resultado = { texto, traduzido: true }
            memoria.set(limpo, resultado)
            return resultado
        } catch (erro) {
            return { texto: limpo, traduzido: false } // não guarda: tenta de novo na próxima visita
        } finally {
            window.clearTimeout(relogio)
        }
    }

    return { paraPortugues }
})()
