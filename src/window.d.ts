interface Window {
  electron?: {
    playSound(soundFile: string): Promise<void>
    showMatchSlips(roundId: string): Promise<void>
  }
}
