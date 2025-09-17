import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import tailwindcss from '@tailwindcss/vite'
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
// import Sonda from 'sonda/vite'

// Rolling our own proxy since we seen issues with deno 2.3
// from request aborted crashing the server
const denoProxy = () => ({
  name: 'deno-proxy',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url.startsWith('/api/')) return next()
      const hasBody = !(req.method === 'GET' || req.method === 'HEAD')
      const controller = new AbortController()
      res.on('close', () => controller.abort())
      fetch(`http://localhost:${3001}${req.url}`, {
        method: req.method,
        signal: controller.signal,
        headers: { ...req.headers },
        body: hasBody ? Readable.toWeb(req) : undefined,
        redirect: 'manual',
      })
        .then((apiRes) => {
          const headers = Object.fromEntries(apiRes.headers)
          const cookies = apiRes.headers.getSetCookie()
          if (cookies.length > 0) headers['set-cookie'] = cookies
          res.writeHead(apiRes.status, headers)
          return apiRes.body
            ? pipeline(Readable.fromWeb(apiRes.body), res)
            : res.end()
        })
        .catch((err) => {
          if (controller.signal.aborted) return
          console.error('Error while attempting to proxy', req.method, req.url)
          console.error(err)
          next()
        })
    })
  },
})

export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
  root: join(import.meta.dirname, './web'),
  plugins: [
    preact({ jsxImportSource: 'preact' }),
    tailwindcss(),
    // Sonda({
    //   enabled: true,
    //   format: 'html',
    // }),
    denoProxy(),
  ],
})
