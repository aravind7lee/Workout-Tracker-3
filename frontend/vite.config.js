import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })',
    'process.env.NODE_ENV': '"production"'
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
})