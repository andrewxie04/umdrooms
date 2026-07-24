import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    // Dev-only: real room/schedule data. The Netlify functions don't exist in
    // vite dev (404 -> "everything available" fallback) and the live functions
    // send no CORS headers, so proxy them server-side to production. Same-origin
    // from the browser's perspective, zero app-code changes.
    proxy: {
      '/.netlify/functions': {
        target: 'https://umdrooms.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
