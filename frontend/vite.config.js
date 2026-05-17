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
      },
      proxy: {
        '/api': {
          target: 'https://workout-tracker-backend-wga7.onrender.com',
          changeOrigin: true,
          secure: true,
          timeout: 10000,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    // Only drop console/debugger in production builds
    esbuild: isDev ? {} : {
      drop: ['console', 'debugger']
    }
  }
})
