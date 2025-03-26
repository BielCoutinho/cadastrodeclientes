/**
 * Processo de renderização do documento nota.html
 */

//Para debugar e testar a aplicação é necessário  ativar as ferramentes do desenvolverdor <Ctrl><shift><i>


// Capturar foco da caixa de texto
const foco = document.getElementById('inputCliente')

//Alterar as propriedades do documento html ao iniciar a aplicação

document.addEventListener('DOMContentLoaded', () => {
    foco.focus() //Iniciar o documento com foco na caixa de texto
})

//Capturar os dados do formulário (Passo 1: - fluxo)
let frmCli = document.getElementById('frmCli')
let clientes = document.getElementById('inputCliente')


//===========================================================================
//= CRUD Create==============================================================

// Evento relacionado ao botão submit
frmCli.addEventListener('submit',(event) => {
    // Evitar o comportamento padrão (recarregar a página) 
    event.preventDefault()
    // IMPORTANTE! (teste de reecebimento dos dados do form - Passo 1)
    console.log(clientes.value)
    //Criar um objeto para enviar ao main os dados da nota
    const cadastroClientes = {
        textClientes: clientes.value

    }
    //Enviar o objeto para o main (Passo 2: fluxo)
    api.createClientes(cadastroClientes)
})

//== Fim - CRUD Create ======================================================
//===========================================================================
