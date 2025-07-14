//Da bi pozivi ka /api/todo radili iz React-a ka backendu.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://localhost:44303", // tvoj backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
