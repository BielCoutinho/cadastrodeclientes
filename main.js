// Importação dos recursos do framework
// app -> aplicação
// BrowserWindow -> criação da janela
// nativeTheme -> definir o tema claro, escuro ou padrão do sistema
// Menu -> definir um menu personalizado
// Shell -> Acessar links e aplicações externos no navegador padrão
// ipcMain -> Permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// dialog -> Módulo electron para ativar caixa de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

// Ativação do preload.js (importação do path (caminho))
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')
const { on } = require('node:events')

// Importação do modelo de dados (Notes.js)
const clientesModel = require('./src/models/Clientes.js')

// Importação da biblioteca nativa do JS para manipular arquivos
const fs = require('fs')

// Importação do pacote jspdf (arquivos PDF) npm install jspdf
const { jspdf, default: jsPDF } = require('jspdf')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'dark'
  win = new BrowserWindow({
    width: 1010, // Largura
    height: 720, // Altura
    resizable: false, // Maximizar

    // Linhas abaixo para ativação do preload. Importado através da linha de Importação ds métodos conectar e desconectar (módulo de conexão)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Carregar o menu personalizado
  // Atenção! Antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))


  // Carregar o documento HTML na janela
  win.loadFile('./src/views/index.html')
}

// Janela sobre
let about
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // Obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // Validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 700, // Largura
      height: 550, // Altura
      autoHideMenuBar: true, // Esconder o menu do browser
      resizable: false, // Maximizar
      minimizable: false, // Minimizar
      parent: mainWindow, // Estabelecer uma relação hierárquica entre janelas
      modal: true // Criar uma janela modal
    })
  }

  about.loadFile('./src/views/sobre.html')
}

// Inicialização da aplicação (assincronismo)
app.whenReady().then(() => {
  createWindow()

  // Melhor local para estebelecer a conexão com o banco de dados
  // No MongoDb é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e fechar a conexão e encerrar quando o aplicativo for finalizado
  // ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  ipcMain.on('db-connect', async (event) => {
    // A linha abaixo estabelece a conexão com o banco de dados
    await conectar()
    // Enviar ao rendereizador uma mensagem para trocar a imagem do ícone do status do banco de dados (criar um delay de 0.5s ou 1s para sincronização com a nuvem)
    setTimeout(() => {
      // Enviar ao renderizador a mensagem "conectado"
      // db-status (IPC - comunicação entre processos - autorizada pelo preload.js)
      event.reply('db-status', "conectado")
    }, 500) // 500ms = 0.5s
  })

  // Só ativar a janela principal se nenhuma outra estiver ativa
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Se o sistema não for MAC, encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for finalizada
app.on('before-quit', async () => {
  await desconectar()
})

// Reduzir a verbosidade de logs não críticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

// Template do menu
// Abertura e fechamento em [] é para a criação de um vetor
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Sair',
        accelerator: 'Alt+F4',
        click: () => app.quit()
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
      }
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir zoom',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'DevTools',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Repositório',
        click: () => shell.openExternal('https://github.com/BielCoutinho/cadastrodeclientes')
      },
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

//===========================================================================
//= CRUD Create =============================================================

// Recebimento do objeto que contem os dados da nota
ipcMain.on('create-clientes', async (event, cadastroClientes) => {
  //IMPORTANTE! Teste do reecebimento do objeto (Passo 2)
  console.log(cadastroClientes)
  //Criar uma nova estrutura de dados para salvar no banco
  //Atençaõ!! os atributos da estrutura precisam se idênticos ao modelo e os valores são obtidos através do objeto

  try {
    const newClientes = clientesModel({
      nome: cadastroClientes.nome,
      cpf: cadastroClientes.cpf,
      email: cadastroClientes.email,
      telefone: cadastroClientes.telefone,
      cep: cadastroClientes.cep,
      logradouro: cadastroClientes.logradouro,
      numero: cadastroClientes.numero,
      complemento: cadastroClientes.complemento,
      bairro: cadastroClientes.bairro,
      cidade: cadastroClientes.cidade,
      uf: cadastroClientes.uf

    })
    //Salvar a nota no banco de dados (Passo 3:fluxo)
    await newClientes.save()


    //confirmação de cliente adicionado ao banco (uso do dialog)
    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      // se o botão OK for pressionando
      if (result.response === 0) {
        //enviar um pedido para o renderizador limpar os campos (preload.js)
        event.reply('reset-form')
      }
    })

  } catch (error) {
    // Tratamento da exceção de CPF duplicado
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "ATENÇÃO!",
        message: "CPF já cadastrado. \n Verfique o número digitado.",
        buttons: ['OK']
      }).then((result) => {
        // Se o botão OK for pressionado
        if (result.response === 0) {
          event.reply('reset-cpf')
        }
      })
    } else {
      console.log(error)
    }
  }

})


//== Fim - CRUD Create ======================================================
//===========================================================================


//===========================================================================
//= Relatório de clientes ===================================================

async function relatorioClientes() {
  try {
    //================================================
    //         Configuração do documento PDF
    //================================================
    const doc = new jsPDF('p', 'mm', 'a4') // p -> portrait (em pé) / l -> landscape (deitado) / mm -> milímetro / a4 -> tamanho da folha

    //Inserir data atual no documento
    // p (portrait) l (landscape)
    // a4 (210 mm x 297 mm)
    const dataAtual = new Date().toLocaleDateString('pr-BR')
    // a linha a baixo escreve um texto no documento (no caso a data atual)
    // doc.setFontSize() altera o tamanho da fonte em ponto (= word)
    doc.setFontSize(10)
    doc.text(`Data: ${dataAtual}`, 150, 15) //(x,y (mm))
    doc.setFontSize(18)
    doc.text("Relatórios de Clientes", 15, 30)
    doc.setFontSize(12)
    let y = 40 //variável de apoio
    // cabeçalho da tabela
    doc.text("Nome", 14, y)
    doc.text("Telefone", 85, y)
    doc.text("E-mail", 130, y)
    y += 5

    //desenhar uma linha
    doc.setLineWidth(0.5)
    doc.line(10, y, 200, y) // (10 (inicio)_________200(fim))
    y += 10

    //=========================================================
    //     Obter a listagem de clientes (ordens alfabética)
    //=========================================================

    const clientes = await clientesModel.find().sort({ nome: 1 })
    // Teste  de recebimento (IMPORANTE)
    //console.log(clientes)

    // popular o documento pdf com os clientes cadastrado
    clientes.forEach((c) => {
      // criar uma nova pádina se y > 280mm (A4 = 297mm)
      if (y > 280) {
        doc.addPage()
        y = 20 // margem de 20mm para iniciar a nova folha
        // cabeçalho da tabela
        doc.text("Nome", 14, y)
        doc.text("Telefone", 85, y)
        doc.text("E-mail", 130, y)
        y += 5

        //desenhar uma linha
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y) // (10 (inicio)_________200(fim))
        y += 10
      }
      doc.text(c.nome, 15, y)
      doc.text(c.telefone, 85, y)
      doc.text(c.email, 130, y)
      y += 15

    })


    //================================================
    //  Númeração automáica de páginas
    //================================================

    const pages = doc.internal.getNumberOfPages()
    for (let i=1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${pages}` , 105,290, {align: 'center'})
    }

    //================================================
    //  Abrir o arquivo PDF no sistema operacional
    //================================================
    // Definir o caminho do arquivo temporário e nome do arquivo com extensão .pdf (IMPORTANTE!)
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')
    // Salvar temporariamente o arquivo
    doc.save(filePath)
    // Abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

//= Fim - Relatório de clientes =============================================
//===========================================================================


//===========================================================================
//= CRUD Read ===============================================================
 
ipcMain.on ('search-name', async (event, cliName) => {
  //teste de recebimento do nome cliente (passo2)
  console.log(cliName)

  try {
    //passos 3 e 4 (busaca dos dados do cliente pelo nome)
    //RegExp (expressão regular 'i' -> insensitive (ignorar letras maiúsculas ou minúsculas))
    const client = await clientesModel.find({
      nome: new RegExp(cliName, 'i') 
    })
    //teste a busca do cliente pelo nome (passos 3 e 4)
    console.log(client)
    //enviar ao renderizador (rendererClient) os dados do cliente (passo 5) OBS: não esquecer de converter para string 

    event.reply('render-client', JSON.stringify(client))

  } catch (error) {
    console.log(error)
  }
})

//== Fim - CRUD Read ========================================================
//===========================================================================