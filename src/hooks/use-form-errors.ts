import { useCallback, useState } from 'react'
import { DatabaseError, RecordValidationError } from '../db/errors'

export abstract class FormErrors {
  abstract any(key: (string | null)[] | string | null): boolean
  abstract get(key: (string | null)[] | string | null): string[] | null
  abstract except(key: (string | null)[] | string | null): string[] | null
}

class NullFormErrors extends FormErrors {
  override any(): boolean {
    return false
  }

  override get(): string[] | null {
    return null
  }

  override except(): string[] | null {
    return null
  }
}

class MappedFormErrors extends FormErrors {
  constructor(private readonly errors: Map<string | null, string[]>) {
    super()
  }

  override any(key: (string | null)[] | string | null): boolean {
    if (Array.isArray(key)) {
      return key.some((k) => this.any(k))
    }

    return (this.errors.get(key)?.length ?? 0) > 0
  }

  override get(key: (string | null)[] | string | null): string[] | null {
    if (Array.isArray(key)) {
      return key.flatMap((k) => this.get(k) ?? [])
    }

    return this.errors.get(key) ?? null
  }

  override except(key: (string | null)[] | string | null): string[] | null {
    if (!Array.isArray(key)) {
      key = [key]
    }

    return Array.from(this.errors.entries())
      .filter(([k]) => !key.includes(k))
      .flatMap(([, v]) => v)
  }
}

const NULL_FORM_ERRORS = new NullFormErrors()

export default function useFormErrors() {
  const [errors, _setErrors] = useState<FormErrors>(NULL_FORM_ERRORS)

  const setErrors = useCallback(
    (error: DatabaseError | Error | unknown) => {
      if (error instanceof RecordValidationError) {
        const errors = new Map<string | null, string[]>()

        error.errors.forEach(([key, message]) => {
          let fullMessage = (key ? `${key} ${message}` : message).replace(/^[a-z]/, (c) => c.toUpperCase())

          if (!fullMessage.endsWith('.')) {
            fullMessage += '.'
          }

          if (errors.has(key)) {
            errors.get(key)!.push(fullMessage)
          } else {
            errors.set(key, [fullMessage])
          }
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
