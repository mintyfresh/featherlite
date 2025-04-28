import { app, BrowserWindow, ipcMain } from 'electron'
import { copyFile, existsSync, readdir } from 'fs'
import { dirname, join } from 'path'
import player from 'play-sound'
import { tmpNameSync } from 'tmp'
import { fileURLToPath } from 'url'

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

process.env.DIST = join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

let mainWindow: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const PRELOAD_PATH = app.isPackaged
  ? join(process.env.DIST!, 'assets', 'preload.js')
  : join(__dirname, '../electron', 'preload.js')

// Initialize the sound player
const audioPlayer = player({})
const soundAssets = new Map<string, string>()

function extractSoundAssets() {
  // File files with .wav, .mp3, .ogg extensions
  readdir(process.env.VITE_PUBLIC!, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error('Error reading sound assets:', err)
      return
    }

    const soundFiles = files.filter(
      (file) =>
        file.isFile() && (file.name.endsWith('.wav') || file.name.endsWith('.mp3') || file.name.endsWith('.ogg'))
    )
    console.log('soundFiles', soundFiles)

    soundFiles.forEach((file) => {
      if (app.isPackaged) {
        const srcPath = join(process.env.VITE_PUBLIC!, file.name)
        const dstPath = tmpNameSync({ postfix: file.name })

        soundAssets.set(file.name, dstPath)

        copyFile(srcPath, dstPath, (err) => {
          if (err) {
            console.error('Error copying sound file:', err)
          }
        })
      } else {
        soundAssets.set(file.name, join(process.env.VITE_PUBLIC!, file.name))
      }
    })

    console.log('soundAssets', soundAssets)
  })
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: join(process.env.VITE_PUBLIC!, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
    },
  })

  // Test active push message to Renderer-process.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(process.env.DIST!, 'index.html'))
  }
}

// Set up IPC handlers
ipcMain.on('play-sound', (_, soundFile: string) => {
  const soundPath = soundAssets.get(soundFile)
  console.log('play-sound', soundFile, soundPath)

  if (!soundPath || !existsSync(soundPath)) {
    console.error(`Sound file not found: ${soundPath}`)
    return
  }

  audioPlayer.play(soundPath, (err) => {
    if (err) console.error(`Error playing sound: ${err}`)
  })
})

ipcMain.on('show-match-slips', (_, roundId: string) => {
  const matchSlipsWindow = new BrowserWindow({
    width: 600,
    height: 800,
    autoHideMenuBar: true,
    icon: join(process.env.VITE_PUBLIC!, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    matchSlipsWindow.loadURL(`${VITE_DEV_SERVER_URL}#/rounds/${roundId}/slips`)
  } else {
    matchSlipsWindow.loadFile(join(process.env.DIST!, 'index.html'), {
      hash: `/rounds/${roundId}/slips`,
    })
  }
})

ipcMain.on('show-timers', (_, eventId: string) => {
  const timersWindow = new BrowserWindow({
    autoHideMenuBar: true,
    icon: join(process.env.VITE_PUBLIC!, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: PRELOAD_PATH,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    timersWindow.loadURL(`${VITE_DEV_SERVER_URL}#/timers/${eventId}/popout`)
  } else {
    timersWindow.loadFile(join(process.env.DIST!, 'index.html'), {
      hash: `/timers/${eventId}/popout`,
    })
  }
})

app.on('ready', () => {
  extractSoundAssets()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.whenReady().then(createMainWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})
