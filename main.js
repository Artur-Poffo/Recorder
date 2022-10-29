require("dotenv").config()
const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require("electron")

const os = require("os")
const fs = require("fs")
const path = require("path")

//Preferences Class:

const Store = require("./Store")

const preferences = new Store({
  configName: "user-config",
  defaults: {
    destination: path.join(os.homedir(), "audios")
  }
})

//Destination of save files:
let destination = preferences.get("destination")

const isDev = process.env.NODE_ENV !== undefined && process.env.NODE_ENV === "development" ? true : false
const isMac = process.platform == "darwin"

function createPrefWindow() {
  const Prefewin = new BrowserWindow({
    width: isDev ? 950 : 500,
    resizable: isDev ? true : false,
    height: 200,
    show: false,
    backgroundColor: "#234",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  Prefewin.loadFile("./src/PrefeWindow/index.html")

  Prefewin.once("ready-to-show", () => {
    Prefewin.show()

    Prefewin.webContents.send("updateDestinationPath", destination)
  })

  if (isDev) {
    Prefewin.webContents.openDevTools()
  }
}


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
          label: "Preferences",
          click: () => { createPrefWindow() }
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

ipcMain.handle("showDist", async (e) => {
  const result = await dialog.showOpenDialog({properties: ["openDirectory"]})

  const dirPath = result.filePaths[0]
  preferences.set("destination", dirPath)
  destination = preferences.get("destination")

  return destination
})