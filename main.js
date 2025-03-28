
// dialog: módulo electron para ativar caixas de mensagens
const { app, BrowserWindow, nativeTheme, Menu, shell, ipcMain, dialog } = require('electron/main')

// Ativação do preload.js (importação do path)
const path = require('node:path')

// Importação dos métodos conectar e desconectar (modulo de conexão)

const { conectar, desconectar } = require('./database.js')
const { on } = require('node:events')

//Importação do modelo de dados (Notes.js)
const clientesModel = require('./src/models/Clientes.js')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'dark'
  win = new BrowserWindow({
    width: 1010, // largura
    height: 720, // altura
    //frame: false
    resizable: true,
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true,
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

// Janela SOBRE
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // Obter a janela principal
  const mainWindow = BrowserWindow.getFocusedWindow()
  // Validação (se existir a janela principal)
  if (mainWindow) {
    about = new BrowserWindow({
      width: 500,
      height: 400,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      // Estabelecer uma relação hierárquica entre janelas
      parent: mainWindow,
      // Criar uma janela modal (só retorna a principal quando encerrada)
      modal: true
    })
  }

  about.loadFile('./src/views/sobre.html')
}

// Inicialização da aplicação (assincronismo, ou seja, ".them" indica o assincronismo)
app.whenReady().then(() => {
  createWindow()

  // Melhor local para etabelecer a conexão com o banco de dados
  //No mongodb é mais eficiente manter uma única conexão aberta durante todo o tempo de vida do aplicativo e encerrar a conexão quando o aplicativo for finalizado
  //ipcMain.on (receber mensagem)
  // db-connect (rótulo da mensagem)
  ipcMain.on('db-connect', async (event) => {
    //A linha abaixo estabelece a conexão com o banco de dados 
    await conectar()

    //Enviar ao renderizador uma mensagem para trocar a imagem do icone do status do banco de dados (criar um delay de 0.5 ou 1s para sincronização com a nuvem)
    setTimeout(() => {
      //enviar ao renderizador a mensagem "conectado"
      //db-status (IPC - comunicação entre processos - preload.js)
      event.reply('db-status', "conectado")
    }, 500) //500ms = 0.5s
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Se o sistema não for MAC encerrar a aplicação quando a janela for fechada
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Reduzir a verbozidade de logs não criticos (devtools)
app.commandLine.appendSwitch('log-level', '3')

// Template do menu
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
    label: 'Relatório',
    submenu: [
      {
        label: 'Clientes'
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
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: "reload"
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
//= CRUD Create==============================================================

// Recebimento do objeto que contem os dados da nota
ipcMain.on('create-clientes', async (event, cadastroClientes) => {
  //IMPORTANTE! Teste do reecebimento do objeto (Passo 2)
  console.log(cadastroClientes)
  //Criar uma nova estrutura de dados para salvar no banco
  //Atençaõ!! os atributos da estrutura precisam se idênticos ao modelo e os valores são obtidos atraves do objeto sticknotes



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
      if(result.response === 0) {
        //enviar um pedido para o renderizador limpar os campos (preload.js)
        event.reply('reset-form')
      }
    })

  } catch (error) {
    console.log(error)
  }
})


//== Fim - CRUD Create ======================================================
//===========================================================================