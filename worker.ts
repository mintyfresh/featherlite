export default {
  async fetch(request, env) {
    // Only GET and HEAD requests are allowed
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405 })
    }

    const url = new URL(request.url)
    let key = url.pathname.slice(1)

    if (key === '') {
      if (request.method === 'HEAD') {
        return new Response(null, { status: 400 })
      }

      // Default to index.html for root or missing files
      key = 'index.html'
    }

    try {
      return await serveObject(env, key, request)
    } catch (error) {
      console.error('Failed to serve object:', key, 'error:', error)
      // SPA fallback
      return await serveObject(env, 'index.html', request)
    }
  },
}

async function serveObject(env: any, key: string, request: Request) {
  const object = await env.FEATHERLITE_STATIC.get(key, {
    range: request.headers,
    onlyIf: request.headers,
  })

  if (!object) {
    return objectNotFound(key)
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)

  if (object.range) {
    const start = object.range.offset
    const end = object.range.end ?? object.size - 1
    const size = object.size

    headers.set('Content-Range', `bytes ${start}-${end}/${size}`)
  }

  const status = object.body
    ? (object.headers.get('range') !== null ? 206 : 200)
    : 304

  return new Response(object.body, {
    headers,
    status,
  })
}

function objectNotFound(objectName: string) {
  return new Response(`<html>
    <head>
      <title>R2 Object Not Found</title>
    </head>
    <body>
      <h1>Object ${objectName} not found</h1>
    </body>
  </html>`, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
