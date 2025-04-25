import { contextBridge, ipcRenderer } from 'electron'

declare global {
  interface Window {
    electron: {
      playSound(soundFile: string): Promise<void>
    }
  }
}

contextBridge.exposeInMainWorld('electron', {
  playSound(soundFile: string) {
    ipcRenderer.send('play-sound', soundFile)
  },
})

export {}
