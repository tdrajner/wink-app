import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://www.eventbriteapi.com/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eventbrite/, ''),
        headers: {
          'Authorization': 'Bearer HPRJZJH2AUIFVWQDULOX'
        }
      }
    }
  }
})
