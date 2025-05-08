import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      // Correct proxy target based on server README
      "/api": {
        target: "http://localhost:3000", // Match the default PORT in server .env.development.local
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode === 'development',
    minify: 'esbuild', // Ensure esbuild is used for minification
    rollupOptions: {
      output: {
        // Improve chunking strategy
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
             if (id.includes('@mui')) {
               return 'mui-vendor';
             }
             if (id.includes('@tanstack/react-query') || id.includes('axios')) {
               return 'query-axios-vendor';
             }
            return 'vendor'; // Catch-all for other node_modules
          }
        },
      },
    }
  },
  optimizeDeps: {
    // Explicitly include common deps
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled', 'axios', '@tanstack/react-query']
  },
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  }
}))