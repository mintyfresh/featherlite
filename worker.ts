export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    let key = url.pathname.slice(1)

    // Default to index.html for root or missing files
    if (key === '') key = 'index.html'

    try {
      const object = await env.FEATHERLITE_STATIC.get(key)
      if (!object) throw new Error('Not found')

      return new Response(object.body, {
        headers: {
          'Content-Type': getMimeType(key),
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch {
      // SPA fallback
      const index = await env.FEATHERLITE_STATIC.get('index.html')
      return new Response(index.body, {
        headers: { 'Content-Type': 'text/html' },
      })
    }
  },
}

// Basic mime type handler
function getMimeType(path) {
  if (path.endsWith('.js')) return 'application/javascript'
  if (path.endsWith('.css')) return 'text/css'
  if (path.endsWith('.html')) return 'text/html'
  if (path.endsWith('.json')) return 'application/json'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.wav')) return 'audio/wav'
  if (path.endsWith('.mp3')) return 'audio/mpeg'
  if (path.endsWith('.ttf')) return 'font/ttf'
  return 'application/octet-stream'
}
