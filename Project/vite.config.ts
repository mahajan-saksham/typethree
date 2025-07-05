import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      // Define the @/ alias to point to the src directory
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // This helps avoid eval() in production
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
        // Use _assets prefix for clear separation from routes
        chunkFileNames: '_assets/js/[name]-[hash].js',
        entryFileNames: '_assets/js/[name]-[hash].js',
        assetFileNames: '_assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // Make sure base path is set correctly - this is critical
  base: '/'
});
