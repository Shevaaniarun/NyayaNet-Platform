import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Raise warning limit slightly and provide manual chunking for large vendor libs
    chunkSizeWarningLimit: 1000, // KB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor_react';
            if (id.includes('lucide-react')) return 'vendor_icons';
            if (id.includes('date-fns')) return 'vendor_datefns';
            if (id.includes('core-js')) return 'vendor_corejs';
            // default vendor chunk
            return 'vendor';
          }
        }
      }
    }
  },
})
