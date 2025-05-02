import { createContext, useContext, useMemo } from 'react'

export type PlayAudio = () => Promise<void>
export const AudioContext = createContext<Map<string, PlayAudio>>(new Map())

export default function usePlayAudio(clip: string | null): PlayAudio {
  const audioCache = useContext(AudioContext)

  const audioCallback = useMemo(
    () =>
      (clip ? audioCache.get(clip) : null) ??
      (() => {
        throw new Error(`Audio clip ${clip ?? '{null}'} not found`)
      }),
    [audioCache, clip]
  )

  return audioCallback
}
