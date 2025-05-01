import { useEffect, type PropsWithChildren, type ReactNode } from 'react'

export default function PersistStorage({ children }: PropsWithChildren): ReactNode {
  useEffect(() => {
    if (typeof navigator.storage !== 'undefined' && typeof navigator.storage.persist === 'function') {
      navigator.storage
        .persist()
        .then((result) => {
          console.log('Persist storage enabled:', result)
        })
        .catch((error) => {
          console.error('Persist storage failed', error)
        })
    }
  }, [])

  return children
}
