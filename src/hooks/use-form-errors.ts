import { useCallback, useState } from 'react'
import { DatabaseError, RecordInvalidError } from '../db/errors'

export abstract class FormErrors {
  abstract any(key: string | null): boolean
  abstract get(key: string | null): string[] | null
}

class NullFormErrors extends FormErrors {
  override any(_key: string | null): boolean {
    return false
  }

  override get(_key: string | null): string[] | null {
    return null
  }
}

class MappedFormErrors extends FormErrors {
  constructor(private readonly errors: Map<string | null, string[]>) {
    super()
  }

  override any(key: string | null): boolean {
    return (this.errors.get(key)?.length ?? 0) > 0
  }

  override get(key: string | null): string[] | null {
    return this.errors.get(key) ?? null
  }
}

const NULL_FORM_ERRORS = new NullFormErrors()

export default function useFormErrors() {
  const [errors, _setErrors] = useState<FormErrors>(NULL_FORM_ERRORS)

  const setErrors = useCallback(
    (error: DatabaseError | Error | unknown) => {
      if (error instanceof RecordInvalidError) {
        const errors = new Map<string | null, string[]>()

        error.errors.forEach(([key, message]) => {
          const fullMessage = key ? `${key} ${message}` : message
          errors.get(key)?.push(fullMessage) ?? errors.set(key, [fullMessage])
        })

        _setErrors(new MappedFormErrors(errors))
      } else if (error instanceof Error) {
        _setErrors(new MappedFormErrors(new Map([[null, [error.message]]])))
      } else if (error) {
        _setErrors(new MappedFormErrors(new Map([[null, ['An unknown error occurred']]])))
      } else {
        _setErrors(NULL_FORM_ERRORS)
      }
    },
    [_setErrors]
  )

  return [errors, setErrors] as const
}
