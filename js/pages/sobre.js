'use strict'

/* ============================================================
   sobre.js — página "Sobre"
   Autor: bryantheconnor-art
   ------------------------------------------------------------
   Explica o projeto: quem fez, quais páginas existem, quais APIs
   são usadas, o esboço que originou o layout, acessibilidade e
   o aviso de direitos autorais (Pokémon © Nintendo).
   Os textos de autoria vêm de SITE (js/config.js).
   ============================================================ */
Pages.sobre = () => {
    const { h } = UI

    // Cria um link externo que abre em nova aba (com aviso para leitores de tela).
    const externo = (texto, url) => h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, texto, h('span', { class: 'sr-only' }, ' (abre em nova aba)'))

    return {
        title: 'Sobre',
        node: h('article', { class: 'page prose' },
            h('h1', { tabindex: -1 }, `Sobre a ${SITE.nome}`),
            h('p', { class: 'lead' }, 'Um projeto educacional que consome APIs públicas para mostrar como uma página dinâmica busca, organiza e traduz dados em tempo real.'),

            // Autoria
            h('h2', {}, 'Autor'),
            h('p', {}, 'Site criado e mantido por ', externo(SITE.autor, SITE.autorUrl), '. O código está aberto no ',
                externo('repositório do GitHub', SITE.repositorioUrl), ', com a história de cada alteração em commits.'),

            // Mapa do site
            h('h2', {}, 'Páginas do site'),
            h('ul', {},
                h('li', {}, h('a', { href: '#home' }, 'Início'), ' — banner com os Pokémon reunidos, Pokémon do dia e atalhos;'),
                h('li', {}, h('a', { href: '#pokedex' }, 'Pokédex'), ' — todas as espécies, com busca e filtros por tipo, região e favoritos;'),
                h('li', {}, 'Detalhe — a página de cada Pokémon, aberta pelos cartões;'),
                h('li', {}, 'Sobre — esta página.')),

            // APIs
            h('h2', {}, 'APIs usadas'),
            h('p', {}, 'Todos os dados são buscados no seu navegador, em tempo real. A fonte principal é a ',
                externo('PokéAPI', 'https://pokeapi.co/'), ', com estes endpoints:'),
            h('ul', {},
                h('li', {}, h('code', {}, '/pokemon'), ' — lista de espécies e dados de cada uma (tipos, atributos, imagens);'),
                h('li', {}, h('code', {}, '/pokemon-species'), ' — descrição, região, habitat, gênero e cadeia de evolução;'),
                h('li', {}, h('code', {}, '/evolution-chain'), ' — linha evolutiva;'),
                h('li', {}, h('code', {}, '/type'), ' — tipos, Pokémon de cada tipo e tabela de fraquezas;'),
                h('li', {}, h('code', {}, '/generation'), ' — Pokémon de cada região (filtro da Pokédex);'),
                h('li', {}, h('code', {}, '/ability'), ' — descrição das habilidades.')),
            h('p', {}, 'Como a PokéAPI não tem textos em português, as descrições passam por uma segunda API, a ',
                externo('MyMemory', 'https://mymemory.translated.net/'),
                ', que faz a tradução automática. Ela pode errar, e os nomes de habilidades ficam no original. Se a tradução não estiver disponível, o texto aparece em inglês com um aviso.'),
            h('p', {}, 'A página inicial também consulta a ',
                externo('API REST pública do GitHub', 'https://docs.github.com/en/rest/users/users'),
                ' para exibir os dados públicos do perfil do autor.'),
            h('p', {}, 'Os favoritos ficam salvos apenas no seu navegador.'),

            // Esboço
            h('h2', {}, 'O esboço do projeto'),
            h('p', {}, 'O layout nasceu deste rascunho de três telas: início com quatro cartões, Pokédex em grade e página de detalhe com a fileira de evolução.'),
            h('figure', { class: 'wireframe' },
                h('img', {
                    src: 'docs/esboco-wireframe.png',
                    alt: 'Esboço à mão de três telas. Tela 1: cabeçalho e quatro cartões grandes. Tela 2: cabeçalho e grade de doze ícones. Tela 3: cabeçalho, imagem grande à esquerda com linhas de texto à direita e três ícones pequenos embaixo.',
                    width: 828, height: 357, loading: 'lazy'
                }),
                h('figcaption', {}, 'Esboço original das telas.')),

            // Acessibilidade
            h('h2', {}, 'Acessibilidade'),
            h('ul', {},
                h('li', {}, 'Navegação completa pelo teclado, com foco visível e link “Pular para o conteúdo”;'),
                h('li', {}, 'Estrutura semântica (cabeçalho, navegação, conteúdo principal e rodapé) e título da aba atualizado em cada página;'),
                h('li', {}, 'Tipos sempre identificados por texto, nunca só por cor, e contraste de cores revisado;'),
                h('li', {}, 'Imagens com texto alternativo, avisos para leitores de tela e animações reduzidas para quem prefere menos movimento.')),

            // Direitos
            h('h2', {}, 'Direitos e créditos'),
            h('p', {}, 'Pokémon e os nomes dos personagens são marcas registradas da Nintendo, Creatures Inc. e GAME FREAK inc. © Nintendo. Todos os direitos reservados.'),
            h('p', {}, 'Este é um trabalho educacional de fã, sem fins lucrativos e sem vínculo oficial ou licença da Nintendo. As imagens e personagens pertencem aos respectivos titulares; este projeto não reivindica direitos de uso. Os dados e imagens são acessados pela PokéAPI.'))
    }
}
