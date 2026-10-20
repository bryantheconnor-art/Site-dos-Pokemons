# Atlas Pokémon

Enciclopédia interativa de Pokémon que consome a [PokéAPI](https://pokeapi.co/) em tempo real.
Projeto educacional de fã, construído sobre o projeto base (HTML + CSS + JavaScript puro, sem frameworks).

> Pokémon e os nomes dos personagens são marcas registradas da Nintendo, Creatures Inc. e GAME FREAK inc.
> © Nintendo. Todos os direitos reservados. Projeto sem fins lucrativos e sem vínculo oficial com a Nintendo.

## Esboço

O layout segue o rascunho de três telas em [`docs/esboco-wireframe.png`](docs/esboco-wireframe.png):

![Esboço das três telas](docs/esboco-wireframe.png)

| Tela do esboço | Página | O que mostra |
| --- | --- | --- |
| 1 — quatro cartões grandes | `#home` | Vitrine em duas colunas com o **Pokémon do dia**, faixa de tipos e 4 cartões 2 × 2 (Pokédex, Aleatório, Favoritos, Sobre) |
| 2 — grade de ícones (3 × 4) | `#pokedex` | 12 Pokémon por página, busca por nome/número, barra de tipos, filtro de favoritos e paginação |
| 3 — imagem + texto + 3 ícones | `#pokemon/25` | Arte oficial, tipos, texto da Pokédex, altura, peso, habilidades, atributos e linha evolutiva |
| — | `#sobre` | Projeto, API, esboço, acessibilidade e aviso de direitos |

São **4 páginas**. Os links antigos `#tipos` e `#favoritos` levam à Pokédex já filtrada, e `#aleatorio` sorteia um Pokémon.

## Inspiração

- **Pottermore**: tipografia com serifa, detalhes dourados, o texto da Pokédex em um "pergaminho" e o conteúdo do dia.
- **Site de Genshin Impact**: tema escuro, vitrine com o personagem em destaque, cartões com brilho na cor do tipo e barra de tipos como as abas de elementos.

## API

Todas as chamadas estão em [`js/api.js`](js/api.js), com cache em memória:

| Endpoint | Uso |
| --- | --- |
| `/pokemon?limit=100000` | Lista de espécies (busca e paginação) |
| `/pokemon/{id}` | Tipos, atributos, habilidades e imagens |
| `/pokemon-species/{id}` | Texto da Pokédex, categoria e cadeia de evolução |
| `/evolution-chain/{id}` | Linha evolutiva |
| `/type` e `/type/{nome}` | Tipos e os Pokémon de cada um |

Os dados da API entram na página sempre como texto (nunca `innerHTML`). Falhas de rede mostram uma
mensagem com o botão "Tentar novamente".

## Acessibilidade

- Link "Pular para o conteúdo", navegação por teclado e foco visível;
- landmarks (`header`, `nav`, `main`, `footer`), um `h1` por página e título da aba atualizado a cada rota;
- foco movido para o título ao trocar de página e avisos (`aria-live`) para carregamento e favoritos;
- tipos identificados por texto (não só por cor), contraste ≥ 4,5:1 nos selos de tipo;
- textos alternativos nas imagens, `prefers-reduced-motion` respeitado e layout responsivo.

## Como executar

Não há etapa de build. Abra `index.html` no navegador ou sirva a pasta:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Estrutura

```
index.html          estrutura, cabeçalho, navegação e rodapé com aviso de direitos
style.css           tema
app.js              roteador por hash
js/api.js           cliente da PokéAPI
js/ui.js            helpers de DOM, tipos em português e favoritos
js/pages/*.js       uma página por arquivo (home, pokedex, detalhe, sobre)
assets/             logo e favicon (originais)
docs/               esboço do projeto
```
