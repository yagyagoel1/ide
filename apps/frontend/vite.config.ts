import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'e6d3-2401-4900-1c61-29e7-4a24-a0f9-a049-5db2.ngrok-free.app'
    ]
  }
})