import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

const MOCK_FILE = path.resolve(__dirname, 'TempFiles/mock-data.json')
const TEMP_FILES_DIR = path.resolve(__dirname, 'TempFiles')

function mockApiPlugin() {
  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use('/TempFiles', (req, res, next) => {
        const clean = req.url.split('?')[0].replace(/^\/+/, '')
        const filePath = path.resolve(TEMP_FILES_DIR, clean)
        if (!filePath.startsWith(TEMP_FILES_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          next()
          return
        }
        const ext = path.extname(filePath).toLowerCase()
        const types = {'.json': 'application/json', '.geojson': 'application/json'}
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
        res.end(fs.readFileSync(filePath))
      })

      server.middlewares.use('/api/mock', (req, res) => {
        if (req.method === 'GET') {
          try {
            const data = fs.readFileSync(MOCK_FILE, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.end(data)
          } catch {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({error: 'Failed to read mock file'}))
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk) => { body += chunk })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(MOCK_FILE, JSON.stringify(parsed, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ok: true}))
            } catch {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({error: 'Failed to write mock file'}))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({error: 'Method not allowed'}))
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  base: "/"
})
