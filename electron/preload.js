const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  playSound(soundFile) {
    ipcRenderer.send('play-sound', soundFile)
  },
  showMatchSlips(roundId) {
    ipcRenderer.send('show-match-slips', roundId)
  },
  showTimers(eventId) {
    ipcRenderer.send('show-timers', eventId)
  },
})
