import { RefObject, useRef } from 'react'

export default function useCallbacksRef<T extends any[]>(...callbacks: T): RefObject<T> {
  const ref = useRef<T>(callbacks)
  ref.current = callbacks

  return ref
}
