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


