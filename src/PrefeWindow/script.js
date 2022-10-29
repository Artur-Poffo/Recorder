const { ipcRenderer } = require("electron")

const destInput = document.querySelector("#dest-path")

ipcRenderer.on("updateDestinationPath", (e, destination) => {
  destInput.value = destination
})

function choose() {
  ipcRenderer.invoke("showDist").then(destination => {
    destInput.value = destination
  })
}

document.getElementById("chooseBtn").addEventListener("click", choose)