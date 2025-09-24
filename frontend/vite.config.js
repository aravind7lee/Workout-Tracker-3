import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' || mode === 'development'
  
  return {
    plugins: [
      react({
        // Enable React refresh in development
        fastRefresh: isDev,
        // Ensure proper JSX runtime
        jsxRuntime: 'automatic'
      })
    ],
    define: {
      // Only set NODE_ENV to production in build mode
      'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            motion: ['framer-motion']
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      hmr: {
        overlay: true
      }
    },
    // Only drop console/debugger in production builds
    esbuild: isDev ? {} : {
      drop: ['console', 'debugger']
    }
  }
})