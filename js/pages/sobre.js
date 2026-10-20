'use strict'

// Sobre: propósito, uso da API, esboço original, acessibilidade e aviso de direitos.
Pages.sobre = () => {
    const { h } = UI

    return {
        title: 'Sobre',
        node: h('article', { class: 'page prose' },
            h('h1', { tabindex: -1 }, 'Sobre o Atlas'),
            h('p', { class: 'lead' }, 'Um projeto educacional que consome a PokéAPI para mostrar como uma página dinâmica conversa com uma API pública.'),

            h('h2', {}, 'Como funciona'),
            h('p', {}, 'Todos os dados são buscados no seu navegador, em tempo real, em ',
                h('a', { href: 'https://pokeapi.co/', target: '_blank', rel: 'noopener noreferrer' }, 'pokeapi.co'), '. Os endpoints usados são:'),
            h('ul', {},
                h('li', {}, h('code', {}, '/pokemon'), ' — lista de espécies e dados de cada uma (tipos, atributos, imagens);'),
                h('li', {}, h('code', {}, '/pokemon-species'), ' — texto da Pokédex, categoria e cadeia de evolução;'),
                h('li', {}, h('code', {}, '/evolution-chain'), ' — linha evolutiva;'),
                h('li', {}, h('code', {}, '/type'), ' — tipos e os Pokémon de cada um.')),
            h('p', {}, 'Os favoritos ficam salvos apenas no seu navegador. Os textos da Pokédex são exibidos no idioma original (inglês), pois a PokéAPI não os oferece em português.'),

            h('h2', {}, 'O esboço do projeto'),
            h('p', {}, 'O layout nasceu deste rascunho de três telas: início com quatro cartões, Pokédex em grade e página de detalhe com a linha evolutiva.'),
            h('figure', { class: 'wireframe' },
                h('img', {
                    src: 'docs/esboco-wireframe.png',
                    alt: 'Esboço à mão de três telas. Tela 1: cabeçalho e quatro cartões grandes. Tela 2: cabeçalho e grade de doze ícones. Tela 3: cabeçalho, imagem grande à esquerda com linhas de texto à direita e três ícones pequenos embaixo.',
                    width: 828, height: 357, loading: 'lazy'
                }),
                h('figcaption', {}, 'Esboço original das telas.')),

            h('h2', {}, 'Acessibilidade'),
            h('ul', {},
                h('li', {}, 'Navegação completa pelo teclado, com foco visível e link “Pular para o conteúdo”;'),
                h('li', {}, 'Estrutura semântica (cabeçalho, navegação, conteúdo principal e rodapé) e título da aba atualizado em cada página;'),
                h('li', {}, 'Tipos sempre identificados por texto, nunca só por cor, e contraste de cores revisado;'),
                h('li', {}, 'Imagens com texto alternativo, avisos para leitores de tela e animações reduzidas para quem prefere menos movimento.')),

            h('h2', {}, 'Direitos e créditos'),
            h('p', {}, 'Pokémon e os nomes dos personagens são marcas registradas da Nintendo, Creatures Inc. e GAME FREAK inc. © Nintendo. Todos os direitos reservados.'),
            h('p', {}, 'Este é um projeto de fã, sem fins lucrativos e sem vínculo oficial com a Nintendo. Dados e imagens vêm da PokéAPI e pertencem aos seus respectivos titulares.'))
    }
}
