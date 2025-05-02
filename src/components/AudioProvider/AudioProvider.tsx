import { useEffect, useState } from 'react'
import { AudioContext, PlayAudio } from '../../hooks/use-play-audio'
import { audioClips } from '../../timer-presets'

const isElectron = typeof window !== 'undefined' && typeof window.electron !== 'undefined'

export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioCache, setAudioCache] = useState<Map<string, PlayAudio>>(new Map())

  useEffect(() => {
    setAudioCache(new Map(Array.from(audioClips).map((clip) => [clip, playAudio(clip)])))
  }, [])

  return <AudioContext.Provider value={audioCache}>{children}</AudioContext.Provider>
}

function playAudio(clip: string): PlayAudio {
  if (isElectron) {
    return () => window.electron!.playSound(clip)
  } else {
    // Preload the audio file so it plays without delay
    const audio = new Audio(`/${clip}`)

    return () => audio.play()
  }
}
