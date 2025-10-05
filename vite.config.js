import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    // port: 3000,
    open: true,
    proxy: {
      '^/(auth|users|products|stripe|checkout|order)': {
        target: 'http://localhost:4000', // Your Node.js backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  envPrefix: "FRONTEND_",
  plugins: [react()],
  base: '/digimart',
})