import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // or your backend port
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: "esbuild",
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
        },
        format: 'es',
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    target: "esnext",
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
      'react/jsx-runtime': 'react/jsx-runtime',
    }
  },
  esbuild: {
    jsx: "automatic",
    jsxInject: `import React from 'react'`,
    pure: ["React.createElement"],
    treeShaking: true,
    keepNames: true,
    legalComments: "none",
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
    exclude: []
  }
})
