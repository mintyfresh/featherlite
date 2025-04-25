const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  playSound(soundFile) {
    ipcRenderer.send('play-sound', soundFile)
  },
})
