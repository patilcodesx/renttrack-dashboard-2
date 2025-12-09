import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    host: true,         // allows access from network / docker
    port: 3000,         // recommended frontend port
    open: true,         // auto-open browser
    proxy: {
      // when mock API disabled, forward all /api calls to backend
      '/api': {
        target: 'http://localhost:8080',   // Spring backend
        changeOrigin: true,
      }
    }
  }
})
