export class DatabaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class RecordNotFoundError extends DatabaseError {
  constructor(record: string, id: string) {
    super(`${record} with id ${id} not found`)
    this.name = 'RecordNotFoundError'
  }
}

export class RecordInvalidError extends DatabaseError {
  constructor(message: string) {
    super(message)
    this.name = 'RecordInvalidError'
  }
}
