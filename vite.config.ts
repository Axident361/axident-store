import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { echoApiPlugin } from './src/server/echoPlugin'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  }

  return {
    plugins: [react(), echoApiPlugin()],
    server: {
      port: 5173,
    },
  }
})
