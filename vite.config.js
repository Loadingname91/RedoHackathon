import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Runs /api/*.js (Vercel-style handlers) inside the Vite dev server, so `npm run dev` needs no Vercel CLI.
function devApi() {
  return {
    name: 'dev-api',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next()
        const name = req.url.slice(5).split('?')[0]
        try {
          const mod = await server.ssrLoadModule(`/api/${name}.js`)
          let body = ''
          for await (const c of req) body += c
          req.body = body ? JSON.parse(body) : {}
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
          await mod.default(req, res)
        } catch (e) { res.statusCode = 500; res.end(JSON.stringify({ error: e.message })) }
      })
    },
  }
}

export default defineConfig({ plugins: [react(), devApi()] })
