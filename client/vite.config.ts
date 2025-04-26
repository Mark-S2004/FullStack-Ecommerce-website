import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // or your backend port
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
      "@pages": "/src/pages",
      "@components": "/src/components",
      "@types": "/src/types",
      "@hooks": "/src/hooks",
      "@assets": "/src/assets",
      "@features": "/src/features",
      "@layouts": "/src/layouts",
      "@routes": "/src/routes",
      "@context": "/src/context",
      "@utils": "/src/utils",
    },
  },
})
