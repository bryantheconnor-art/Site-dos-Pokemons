# Guia de Git: commit, merge e fork

Guia prático para o repositório **[bryantheconnor-art/Site-dos-Pokemons](https://github.com/bryantheconnor-art/Site-dos-Pokemons)**.
Autor do projeto: [bryantheconnor-art](https://github.com/bryantheconnor-art).

> Os comandos abaixo rodam no terminal (Git Bash no Windows). Troque `main` por outro nome só se o seu repositório usar outra branch principal.

---

## 0. Preparação (uma vez só)

```bash
# Seu nome e e-mail aparecem em cada commit
git config --global user.name  "Seu Nome"
git config --global user.email "seu-email@exemplo.com"

# Login no GitHub (o GitHub não aceita mais senha no git push; use o gh ou um token)
gh auth login
```

Baixar o projeto para o computador:

```bash
git clone https://github.com/bryantheconnor-art/Site-dos-Pokemons.git
cd Site-dos-Pokemons
```

---

## 1. COMMIT: salvar uma alteração na história do projeto

Um commit é uma "foto" do projeto com uma mensagem explicando o que mudou. O ideal é **um commit por alteração**.

```bash
git status                       # 1. vê o que mudou
git diff                         # 2. (opcional) vê as linhas alteradas
git add js/pages/home.js         # 3. escolhe os arquivos que entram no commit
git commit -m "feat(home): banner com Pokémon reunidos"   # 4. salva
git log --oneline                # 5. confere a história
```

Dicas:

- `git add .` adiciona tudo de uma vez (confira antes com `git status`).
- Mensagens curtas no padrão `tipo(área): o que mudou`: `feat` (novidade), `fix` (correção), `docs` (documentação), `style` (visual), `refactor` (reorganização).
- Errou a última mensagem? `git commit --amend -m "mensagem nova"` (só antes de enviar ao GitHub).
- Enviar os commits ao GitHub: `git push`.

---

## 2. BRANCH: trabalhar sem mexer na `main`

```bash
git checkout -b feature/site-pokemon-api   # cria e entra na branch
# ...edita, faz commits...
git push -u origin feature/site-pokemon-api   # envia a branch pela primeira vez
```

Depois do primeiro `-u`, basta `git push`.

---

## 3. MERGE: juntar a branch na `main`

### Caminho A — pelo GitHub (Pull Request), o mais comum

1. Rode `git push -u origin feature/site-pokemon-api`.
2. No repositório, clique em **Compare & pull request**.
3. Confira os arquivos alterados e escreva uma descrição.
4. Clique em **Create pull request** e depois em **Merge pull request** → **Confirm merge**.
5. Atualize seu computador:

```bash
git checkout main
git pull
```

### Caminho B — pelo terminal

```bash
git checkout main
git pull                                   # garante que a main está atualizada
git merge feature/site-pokemon-api         # traz a branch para a main
git push                                   # envia o resultado
```

### Se der conflito

O Git avisa `CONFLICT` e marca no arquivo os trechos que não conseguiu juntar:

```text
<<<<<<< HEAD
versão da main
=======
versão da sua branch
>>>>>>> feature/site-pokemon-api
```

1. Abra o arquivo, escolha (ou combine) as versões e apague as linhas `<<<<<<<`, `=======` e `>>>>>>>`.
2. `git add arquivo-resolvido`
3. `git commit` (o Git já sugere a mensagem de merge).

Quer desistir? `git merge --abort`.

### Histórias diferentes ("unrelated histories")

O repositório do GitHub começou só com um README (o commit inicial). Se o seu projeto foi criado separado no computador, as duas histórias não têm ancestral em comum e o Pull Request não consegue juntar. A solução é trazer a `main` do GitHub para a sua branch **uma vez**:

```bash
git remote add origin https://github.com/bryantheconnor-art/Site-dos-Pokemons.git
git fetch origin
git merge origin/main --allow-unrelated-histories
# README.md vai dar conflito (os dois têm um): fique com a versão do projeto, git add README.md, git commit
git push -u origin feature/site-pokemon-api
```

Depois disso o Pull Request funciona normalmente. (A branch deste projeto já vem com esse merge feito.)

---

## 4. FORK: sua cópia de um repositório de outra pessoa

Fork serve para **contribuir com um projeto que não é seu** (ou para fazer uma cópia independente). Observações importantes:

- O GitHub **não deixa fazer fork do próprio repositório**. Como `Site-dos-Pokemons` já pertence a `bryantheconnor-art`, quem faz fork é **outra pessoa** (um colega, o professor, outra conta sua).
- Quem é dono do repositório trabalha com **branch + Pull Request** (seção 2 e 3).

### Passo a passo de quem vai fazer o fork

1. Entre em <https://github.com/bryantheconnor-art/Site-dos-Pokemons> com a **sua** conta.
2. Clique em **Fork** (canto superior direito) → **Create fork**. Agora existe `SEU-USUARIO/Site-dos-Pokemons`.
3. Baixe a **sua** cópia e ligue o projeto original como `upstream`:

```bash
git clone https://github.com/SEU-USUARIO/Site-dos-Pokemons.git
cd Site-dos-Pokemons
git remote add upstream https://github.com/bryantheconnor-art/Site-dos-Pokemons.git
git remote -v        # origin = seu fork · upstream = projeto original
```

4. Crie uma branch, faça commits e envie para o **seu** fork:

```bash
git checkout -b minha-melhoria
# ...edita e faz commits...
git push -u origin minha-melhoria
```

5. No GitHub, abra o **Pull Request** do seu fork para `bryantheconnor-art/Site-dos-Pokemons`. O dono revisa e faz o merge.

### Manter o fork atualizado

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## 5. Resumo rápido

| Quero... | Comando |
| --- | --- |
| Ver o que mudou | `git status` |
| Salvar uma alteração | `git add arquivo` → `git commit -m "mensagem"` |
| Enviar ao GitHub | `git push` |
| Criar uma branch | `git checkout -b nome-da-branch` |
| Juntar uma branch na main | Pull Request no GitHub, ou `git checkout main` → `git merge nome-da-branch` |
| Baixar novidades | `git pull` |
| Copiar o projeto de outra pessoa | **Fork** no GitHub → `git clone` |
