import apiServer from './api/server.ts'
import { serveDir } from 'jsr:@std/http/file-server'

const indexHtml = await Deno.readFile(
  import.meta.dirname + '/web/dist/index.html',
)
const htmlContent = { headers: { 'Content-Type': 'text/html' } }
const serveDirOpts = { fsRoot: import.meta.dirname + '/web/dist' }

Deno.serve(async (req) => {
  const { pathname } = new URL(req.url)

  if (pathname.startsWith('/api/')) {
    return await apiServer.fetch(req)
  }

  if (pathname.includes('.')) {
    return serveDir(req, serveDirOpts)
  }

  return new Response(indexHtml, htmlContent)
})
