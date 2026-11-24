import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // O proxy repassa tudo que começa com /api para o Spring Boot (porta 8080).
    // Assim o navegador "pensa" que front e API são a mesma origem e não há
    // problema de CORS, sem precisar mexer no backend.
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  test: {
    // jsdom simula o navegador (document, window) nos testes do Vitest.
    environment: 'jsdom',
  },
})
