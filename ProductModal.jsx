import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, calls to /api are proxied to the backend on :4000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
