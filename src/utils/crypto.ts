export async function sha256Hexdigest(input: string): Promise<string> {
  const encoder = new TextEncoder()

  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(input))
  const buffer = Array.from(new Uint8Array(hash))

  return buffer.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
