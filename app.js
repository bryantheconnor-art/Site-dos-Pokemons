'use strict'

const root = document.getElementById('root')
const navigationLinks = document.querySelectorAll('nav a')

// Cria o cartão central usado como moldura para cada seção.
function createCard(sectionName) {
    const card = document.createElement('section')
    card.className = `content-card ${sectionName}-card`
    return card
}

// Exibe a apresentação da FATEC na página inicial.
function homepage() {
    const card = createCard('home')
    const eyebrow = document.createElement('p')
    eyebrow.className = 'eyebrow'
    eyebrow.textContent = 'Centro Paula Souza'

    const titulo = document.createElement('h1')
    titulo.textContent = 'FATEC São Roque'

    const subtitulo = document.createElement('h2')
    subtitulo.textContent = 'Conhecimento que transforma o futuro.'

    const texto = document.createElement('p')
    texto.textContent = 'Explore os cursos, conheça a instituição e encontre as informações de contato em uma experiência simples e dinâmica.'

    const linkCursos = document.createElement('a')
    linkCursos.className = 'button-link'
    linkCursos.href = '#cursos'
    linkCursos.textContent = 'Conheça os cursos'

    card.append(eyebrow, titulo, subtitulo, texto, linkCursos)
    root.replaceChildren(card)
}

// Exibe informações institucionais da FATEC São Roque.
function sobrePage() {
    const card = createCard('about')
    const titulo = document.createElement('h1')
    titulo.textContent = 'Sobre a FATEC'

    const primeiroParagrafo = document.createElement('p')
    primeiroParagrafo.textContent = 'A Faculdade de Tecnologia (FATEC) São Roque faz parte da rede de ensino superior tecnológico do Centro Paula Souza, instituição pública do Governo do Estado de São Paulo. As FATECs oferecem cursos superiores voltados à tecnologia e à formação de profissionais preparados para acompanhar as necessidades do mercado de trabalho.'

    const segundoParagrafo = document.createElement('p')
    segundoParagrafo.textContent = 'Com uma formação que une conhecimentos teóricos e práticos, a FATEC contribui para o desenvolvimento profissional dos estudantes e para o crescimento da região. A unidade de São Roque atende pessoas que buscam ampliar seus conhecimentos e construir uma carreira.'

    card.append(titulo, primeiroParagrafo, segundoParagrafo)
    root.replaceChildren(card)
}

// Exibe os cursos em blocos e permite adicionar opções à lista nesta sessão.
function cursosPage() {
    const card = createCard('courses')
    const titulo = document.createElement('h1')
    titulo.textContent = 'Nossos cursos'

    const descricao = document.createElement('p')
    descricao.textContent = 'Conheça algumas opções de formação:'

    const listaCursos = document.createElement('ul')
    listaCursos.className = 'course-grid'
    const cursos = ['Sistemas para Internet', 'Administração', 'Gastronomia', 'Turismo']

    function adicionarCurso(nomeCurso) {
        const itemCurso = document.createElement('li')
        itemCurso.className = 'course-tile'
        itemCurso.textContent = nomeCurso
        listaCursos.appendChild(itemCurso)
    }

    cursos.forEach(adicionarCurso)

    const formulario = document.createElement('form')
    formulario.className = 'inline-form'
    const rotulo = document.createElement('label')
    rotulo.htmlFor = 'novo-curso'
    rotulo.textContent = 'Adicionar curso à lista'

    const campoCurso = document.createElement('input')
    campoCurso.id = 'novo-curso'
    campoCurso.name = 'curso'
    campoCurso.type = 'text'
    campoCurso.placeholder = 'Nome do curso'
    campoCurso.required = true

    const botaoAdicionar = document.createElement('button')
    botaoAdicionar.type = 'submit'
    botaoAdicionar.textContent = 'Adicionar'
    formulario.append(rotulo, campoCurso, botaoAdicionar)

    formulario.addEventListener('submit', (event) => {
        event.preventDefault()
        adicionarCurso(campoCurso.value.trim())
        formulario.reset()
        campoCurso.focus()
    })

    const observacao = document.createElement('p')
    observacao.className = 'form-note'
    observacao.textContent = 'Os cursos adicionados aqui ficam apenas nesta sessão; não há API conectada.'

    card.append(titulo, descricao, listaCursos, formulario, observacao)
    root.replaceChildren(card)
}

// Exibe os dados oficiais de contato e um formulário centralizado.
function contatoPage() {
    const card = createCard('contact')
    const titulo = document.createElement('h1')
    titulo.textContent = 'Fale com a FATEC'

    const instituicao = document.createElement('h2')
    instituicao.textContent = 'FATEC São Roque – Dr. Bernardino de Campos'

    const detalhes = document.createElement('div')
    detalhes.className = 'contact-details'

    const endereco = document.createElement('p')
    endereco.textContent = 'Rua Marechal Deodoro da Fonseca, 132 - Centro, São Roque - SP, CEP: 18130-070'

    const telefone = document.createElement('p')
    telefone.append('Telefone: ')
    const linkTelefone = document.createElement('a')
    linkTelefone.href = 'tel:+551147136604'
    linkTelefone.textContent = '(11) 4713-6604'
    telefone.appendChild(linkTelefone)

    const horario = document.createElement('p')
    horario.textContent = 'Funcionamento: segunda a sexta, das 09h às 21h; sábado, das 09h às 13h.'

    const fonte = document.createElement('a')
    fonte.href = 'https://fatecsaoroque.cps.sp.gov.br/'
    fonte.target = '_blank'
    fonte.rel = 'noopener noreferrer'
    fonte.textContent = 'Acessar o site oficial'
    detalhes.append(endereco, telefone, horario, fonte)

    const formulario = document.createElement('form')
    formulario.className = 'contact-form'

    const nome = document.createElement('input')
    nome.name = 'nome'
    nome.type = 'text'
    nome.placeholder = 'Seu nome'
    nome.autocomplete = 'name'
    nome.required = true

    const email = document.createElement('input')
    email.name = 'email'
    email.type = 'email'
    email.placeholder = 'Seu e-mail'
    email.autocomplete = 'email'
    email.required = true

    const mensagem = document.createElement('textarea')
    mensagem.name = 'mensagem'
    mensagem.placeholder = 'Escreva sua mensagem'
    mensagem.rows = 4
    mensagem.required = true

    const enviar = document.createElement('button')
    enviar.type = 'submit'
    enviar.textContent = 'Preparar mensagem'

    const status = document.createElement('p')
    status.className = 'form-note'
    status.setAttribute('aria-live', 'polite')

    formulario.append(nome, email, mensagem, enviar, status)
    formulario.addEventListener('submit', (event) => {
        event.preventDefault()
        status.textContent = 'Formulário preenchido. O envio de mensagens ainda não está conectado a uma API.'
    })

    card.append(titulo, instituicao, detalhes, formulario)
    root.replaceChildren(card)
}

// Troca o conteúdo sem recarregar o documento e atualiza o link selecionado.
function renderPage() {
    const pagina = window.location.hash.slice(1)

    if (pagina === 'about') {
        sobrePage()
    } else if (pagina === 'cursos') {
        cursosPage()
    } else if (pagina === 'contato') {
        contatoPage()
    } else {
        homepage()
    }

    navigationLinks.forEach((link) => {
        const ativo = link.hash === `#${pagina || 'home'}`
        link.classList.toggle('active', ativo)
        if (ativo) {
            link.setAttribute('aria-current', 'page')
        } else {
            link.removeAttribute('aria-current')
        }
    })
}

// Atualiza a seção ao navegar ou usar os botões voltar e avançar do navegador.
window.addEventListener('hashchange', renderPage)
renderPage()
