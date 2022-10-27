const { app, BrowserWindow, Menu } = require("electron")

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
      defaultEncoding: false
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
          label: "Open Destination Folder"
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