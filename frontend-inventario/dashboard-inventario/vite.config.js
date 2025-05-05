import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'


// https://vite.dev/config/
export default defineConfig({
  server: {
    open: true, // Esto abrirá automáticamente el navegador
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Asegúrate que coincida con el puerto de tu backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})
