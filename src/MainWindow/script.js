//requires:
const { ipcRenderer } = require("electron")

document.addEventListener("DOMContentLoaded", () => {

  //Declarations:
  const display = document.querySelector("#display")
  const recordBtn = document.querySelector("#record")
  const micInput = document.querySelector("#mic")

  let isRecording = false
  let deviceSelectedId = null
  let startTime = null
  let chunks = []
  let mediaRecorder = null

  //Get available devices:

  navigator.mediaDevices.enumerateDevices().then(devices => {
    devices.forEach(device => {
      if (device.kind === "audioinput") {
        if (!deviceSelectedId) {
          deviceSelectedId = device.deviceId
        }

        const option = document.createElement("option")
        option.value = device.deviceId
        option.text = device.label

        micInput.appendChild(option)
      }
    })
  })

  micInput.addEventListener("change", e => {
    deviceSelectedId = e.target.value
  })

  //Update Btn:

  function UpdateBtnTo(recording) {
    if (recording) {
      recordBtn.classList.add("recording")
    } else {
      recordBtn.classList.remove("recording")
    }
  }

  function handleRecord(recording) {
    if (recording) {
      //stop
      mediaRecorder.stop()
    } else {
      //start
      navigator.mediaDevices.getUserMedia({audio: {deviceId: deviceSelectedId}, video: false}).then(stream => {
        mediaRecorder = new MediaRecorder(stream)
        mediaRecorder.start()

        startTime = Date.now()
        updateDisplay()

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data)
        }

        mediaRecorder.onstop = (e) => {
          saveData()
        }
      })
    }
  }

  function updateDisplay() {
    display.innerHTML = FormatDisplay(Date.now() - startTime)
    if (isRecording) {
      window.requestAnimationFrame(updateDisplay)
    } else {
      display.innerHTML = "00:00:00.0"
    }
  } 

  function FormatDisplay(duration) {
    let mili = parseInt((duration % 1000) / 100)
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / 1000 / 60) % 60)
    let hour = Math.floor((duration / 1000 / 60 / 60))

    seconds = seconds < 10 ? "0" + seconds : seconds
    minutes = minutes < 10 ? "0" + minutes : minutes
    hour = hour < 10 ? "0" + hour : hour
    
    return `${hour}:${minutes}:${seconds}.${mili}`
  }

  function saveData() {
    const blob = new Blob(chunks, {"type": "audio/webm; codecs:opus"})
    
    blob.arrayBuffer().then(blobBuffer => {
      const buffer = new Buffer(blobBuffer, "binary")

      ipcRenderer.send("save_buffer", buffer)
    })

    chunks = []
  }

  recordBtn.addEventListener("click", () => {
    UpdateBtnTo(!isRecording)
    handleRecord(isRecording)

    isRecording = !isRecording
  })
})