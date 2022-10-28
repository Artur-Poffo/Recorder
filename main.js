require("dotenv").config()
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron")

const os = require("os")
const fs = require("fs")
const path = require("path")

//Destination of save files:
const destination = path.join(os.homedir(), "audios")

const isDev = process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development" ? true : false
const isMac = process.platform == "darwin"

function createWindow() {
  const win = new BrowserWindow({
    width: isDev ? 950 : 500,
    resizable: isDev ? true : false,
    height: 300,
    show: false,
    backgroundColor: "#234",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadFile("./src/MainWindow/index.html")

  win.once("ready-to-show", () => {
    win.show()
  })

  if (isDev) {
    win.webContents.openDevTools()
  }

  // MENU

  const menuTemplate = [
    {
      label: "Recorder",
      submenu: [
        {
          label: "Preferences"
        },
        {
          label: "Open Destination Folder",
          click: () => { shell.openPath(destination) }
        }
      ]
    },

    {
      label: "File",
      submenu: [
        isMac ? {role: "close"} : {role: "quit"}
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
}

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})

//Save File Event:

ipcMain.on("save_buffer", (e, buffer) => {
  const filePath = path.join(destination, `${Date.now()}`)
  fs.writeFileSync(`${filePath}.webm`, buffer)
})