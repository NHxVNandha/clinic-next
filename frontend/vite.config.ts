import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('ag-grid-community') || id.includes('ag-grid-react')) return 'aggrid'
          if (id.includes('@tanstack/react-query')) return 'query-vendor'
          if (id.includes('react-router-dom')) return 'router-vendor'
          if (id.includes('react-hot-toast') || id.includes('lucide-react') || id.includes('cmdk')) return 'ui-vendor'
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'react-vendor'
          return undefined
        },
      },
    },
  },
})
