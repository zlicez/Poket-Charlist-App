import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    // LOCAL_DEV=true направляет storage-слой на MemStorage и избавляет server/db.ts
    // от требования DATABASE_URL. Тестам это подходит — работаем на in-memory storage.
    env: {
      LOCAL_DEV: "true",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
});
