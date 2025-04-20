import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import useCallbacksRef from './use-callbacks-ref'

type DBQuery = (...args: any) => Promise<any>

export interface LazyDBQueryOptions<Query extends DBQuery> {
  onSuccess?(result: Awaited<ReturnType<Query>>): void
  onError?(error: Error | unknown): void
}

export function useLazyDBQuery<Query extends DBQuery>(query: Query, options: LazyDBQueryOptions<Query> = {}): [
  (...params: Parameters<Query>) => Promise<Awaited<ReturnType<Query>>>,
  {
    called: boolean
    loading: boolean
    error: Error | unknown | null
    result: Awaited<ReturnType<Query>> | null,
    setResult: Dispatch<SetStateAction<Awaited<ReturnType<Query>> | null>>
  }
] {
  type Result = Awaited<ReturnType<Query>>

  const callbacks = useCallbacksRef(
    options?.onSuccess,
    options?.onError
  )

  const [called, setCalled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | unknown | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const call = useCallback(
    async (...params: Parameters<Query>) => {
      const [onSuccess, onError] = callbacks.current

      setCalled(true)
      setLoading(false)
      setError(null)

      try {
        const result = await query(...params)

        setResult(result)
        setError(null)
        onSuccess?.(result)

        return result
      } catch (error) {
        setResult(null)
        setError(error)
        onError?.(error)
      } finally {
        setLoading(false)
      }
    },
    [
      query,
      callbacks,
      setLoading,
      setError,
      setResult,
    ]
  )

  return [
    call,
    {
      called,
      loading,
      error,
      result,
      setResult,
    }
  ] as const
}

export interface DBQueryOptions<Query extends DBQuery> extends LazyDBQueryOptions<Query> {
  params: Parameters<Query>
  skip?: boolean | null
}

export function useDBQuery<Query extends DBQuery>(query: Query, options: DBQueryOptions<Query>) {
  const [call, data] = useLazyDBQuery(query, options)

  useEffect(
    () => {
      if (!options.skip && !data.called) {
        call(...options.params)
      }
    },
    [
      call,
      JSON.stringify(options.params),
      data.called,
      options.skip,
    ]
  )

  return data
}
