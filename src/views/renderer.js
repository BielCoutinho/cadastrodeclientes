/**
 * Processo de renderização do documento index.html
 */

console.log("Processo de Renderização")
  

// inserção da data no rodapé
function obterData() {
    const data = new Date()
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    return data.toLocaleDateString('pt-BR', options)
}

document.getElementById('dataAtual').innerHTML = obterData()

//troca do icone do bancao de dados (status de conexão)
//uso da api do preload.js
api.dbStatus((event, message) => {
    //teste de recebimento da mensagem
    console.log(message)

    if (message === "conectado") {
        document.getElementById('iconeDB').src = "../public/img/dbon.png"
        
    } else {
        document.getElementById('iconeDB').src = "../public/img/dboff.png"
    }

})

/**
 * Processo de renderização do documento nota.html
 */

//Para debugar e testar a aplicação é necessário  ativar as ferramentes do desenvolverdor <Ctrl><shift><i>


// Capturar o foco da caixa de texto
const foco = document.getElementById('buscarCliente')

//criar um vetor global para extrair os dados do cliente
let arrayClient = []
 
// Alterar as propriedades do documento HTML ao iniciar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    //Desativar os botões
    btnUpdate.disabled = true
    btnDelete.disabled = true
    //Iniciar o documento com foco na caixa de texto
    foco.focus()
})

//Capturar os dados do formulário (Passo 1: - fluxo)
let frmCli = document.getElementById('frmCli')
let nomeCliente = document.getElementById('nomeCliente')
let cpfCliente = document.getElementById('cpfCliente')
let emailCliente = document.getElementById('emailCliente')
let telefoneCliente = document.getElementById('telefoneCliente')
let cep = document.getElementById('cep')
let logradouro = document.getElementById('logradouro')
let numero = document.getElementById('numero')
let complemento = document.getElementById('complemento')
let bairro = document.getElementById('bairro')
let cidade = document.getElementById('cidade')
let uf = document.getElementById('uf')


//===========================================================================
//= CRUD Create==============================================================

// Evento relacionado ao botão submit
frmCli.addEventListener('submit', (event) => {
    // Evitar o comportamento padrão (recarregar a página) 
    event.preventDefault()

    console.log(
        nomeCliente.value, cpfCliente.value, emailCliente.value, telefoneCliente.value, 
        cep.value, logradouro.value, numero.value, complemento.value, bairro.value, cidade.value, uf.value
    )

    const cadastroClientes = {
        nome: nomeCliente.value,
        cpf: cpfCliente.value,
        email: emailCliente.value,
        telefone: telefoneCliente.value,
        cep: cep.value,
        logradouro: logradouro.value,
        numero: numero.value,
        complemento: complemento.value,
        bairro: bairro.value,
        cidade: cidade.value,
        uf: uf.value

    }

    console.log("Enviando para o banco: ", cadastroClientes) // Teste
    //Enviar o objeto para o main (Passo 2: fluxo)
    api.createClientes(cadastroClientes)
})

//== Fim - CRUD Create ======================================================
//===========================================================================

//===========================================================================
//= CRUD Read ===============================================================
 
function buscarNome() { // Nome da função é o nome do onclick no buscarCliente
    console.log("Teste do botão buscar")
    // Capturar o nome a ser pesquisado -> Passo 1
    let cliName = document.getElementById('buscarCliente').value
    console.log(cliName) // Teste do passo 1
    //enviar nome do cliente ao main (passo 2)
    api.buscarNome(cliName)
    //receber os dados do cliente (passo 5)
    api.renderClient((event, client) => {
        //teste de recebimento dos dados do cliente
        console.log(client)
        //passo 6 renderização dos dados do cliente (preencher os inputs do form) - Não esquecer de converter os dados de string para JSON
        const clientData = JSON.parse(client)
        arrayClient = clientData
        // uso do forEach para percorrer o vetor e extrair os dados
        arrayClient.forEach((c) => {
            nomeCliente.value = c.nome
            cpfCliente.value = c.cpf
            emailCliente.value =c.email
            telefoneCliente.value = c.telefone
            cep.value = c.cep
            logradouro.value = c.logradouro
            numero.value = c.numero
            complemento.value = c.complemento
            bairro.value = c.bairro
            cidade.value = c.cidade
            uf.value = c.uf
            
        })
    })
}
 
//== Fim - CRUD Read ========================================================
//===========================================================================

//===========================================================================
//== Resetar o formulário ===================================================
function resetForm() {
    // recarregar a página
    location.reload()
}

//Uso da api resetForm quando salvar, editar ou excluir um cliente
api.resetForm((args) => {
    resetForm()
})



//===========================================================================
//== Fim - Resetar o formulário =============================================

// ============================================================
// == Tratamento de exceção CPF duplicado =====================

// Enviar a mensagem de reset-cpf para o main.js
window.electron.onReceiveMessage('reset-cpf', () => {
    cpfCliente.value = "";        // Limpar o campo CPF
    cpfCliente.focus();           // Focar no campo CPF
    cpfCliente.style.border = '2px solid red'; // Adicionar borda vermelha ao campo CPF
})

// == Tratamento de exceção CPF duplicado =====================
// ============================================================






