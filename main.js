const { app, BrowserWindow, nativeTheme, Menu, shell } = require('electron/main')

// Janela principal
let win
const createWindow = () => {
  // definindo tema da janela claro ou escuro
  nativeTheme.themeSource = 'dark'
  win = new BrowserWindow({
    width: 1010, // largura
    height: 720, // altura
    //frame: false
    //resizable: false,
    //minimizable: false,
    //closable: false,
    //autoHideMenuBar: true
  })


 
  // Carregar o menu personalizado
  // Atenção! Antes importar o recurso Menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
 
  // Carregar o documento HTML na janela
  win.loadFile('./src/views/index.html')
}

// Janela SOBRE
function aboutWindow() {
    nativeTheme.themeSource='light'
    // Obter a janela principal
    const mainWindow = BrowserWindow.getFocusedWindow()
    // Validação (se existir a janela principal)
    if (mainWindow) {
      about = new BrowserWindow({
        width: 500,
        height: 500,
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
app.commandLine.appendSwitch('log-level','3')
 
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