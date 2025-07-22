import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        // Cache-busting: Generate unique hashes for each build
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Force new hashes on each build
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    exclude: ["bippy/dist/jsx-runtime", "bippy/dist/jsx-dev-runtime"]
  },
  // Ensure proper MIME types for GitHub Pages
  server: {
    fs: {
      strict: false
    }
  }
});
