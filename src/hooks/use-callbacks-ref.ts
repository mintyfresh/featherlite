import { RefObject, useRef } from 'react'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default function useCallbacksRef<T extends any[]>(...callbacks: T): RefObject<T> {
  const ref = useRef<T>(callbacks)
  ref.current = callbacks

  return ref
}
