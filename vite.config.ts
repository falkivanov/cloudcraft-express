
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimierung für Cloud-Hosting wie STACKIT
  build: {
    outDir: "dist",
    // Optimiert für statische Hosting-Dienste
    assetsDir: "assets",
    // Sourcemaps in Produktion deaktivieren für bessere Performance
    sourcemap: mode !== "production",
    // Chunking-Strategie für besseres Caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom'
          ],
          ui: [
            '@radix-ui/react-tabs',
            '@radix-ui/react-dialog',
            'lucide-react'
          ]
        }
      }
    }
  }
}));
