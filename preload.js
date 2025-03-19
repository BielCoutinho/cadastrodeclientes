/**
 * preload.js - Usado no framework electron para aumentar a segurança e o desempenho
 */

// importação dos recursos do freamework electro
//ipcRederer permite estabelecer uma comunicação entre processos (IPC) main.js <=> renderer.js
// contextBridge: permissões de comunicação entre processos usando a api do electron
const { contextBridge, ipcRenderer } = require ('electron')

//permissoões para estabelecer a comunicação ente processos
contextBridge.exposeInMainWorld('api', {
    dbStatus: (message) => ipcRenderer.on('db-status', message)
})

//Enviar uma mensagem para o main.js estabelecer um conexão com o banco de dados quando iniciar a aplicação
//db-connect (rótulo para identificar a mensagem)
ipcRenderer.send('db-connect')