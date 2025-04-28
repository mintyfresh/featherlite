export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class RecordNotFoundError extends DatabaseError {
  constructor(
    public readonly record: string,
    public readonly id: string
  ) {
    super(`${record} with id ${id} not found`)
    this.name = 'RecordNotFoundError'
  }
}

export class RecordInvalidError extends DatabaseError {
  constructor(
    public readonly record: string,
    public readonly id: string | null,
    public readonly errors: [string | null, string][]
  ) {
    super(`${record} invalid: ${fullMessages(errors).join(', ')}`)
    this.name = 'RecordInvalidError'
  }

  get fullMessages(): string[] {
    return fullMessages(this.errors)
  }
}

function fullMessages(errors: [string | null, string][]): string[] {
  return errors.map(([key, message]) => (key ? `${key} ${message}` : message))
}
