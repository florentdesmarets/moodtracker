import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'

const pkg     = JSON.parse(readFileSync('./package.json', 'utf-8'))
const buildAt = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__:  JSON.stringify(buildAt),
  },
  server: {
    host: true,
  },
})
