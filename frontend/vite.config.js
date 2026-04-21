import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set VITE_API_URL in Vercel environment variables to your backend URL
// e.g. https://primetrade-api.vercel.app
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
