import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";
import { componentTagger } from "lovable-tagger";

const buildTime = new Date().toISOString();

/**
 * Vite plugin: regenerates public/data/umfrage-schema.json from SSOT
 * at every dev-server start and production build.
 */
function surveySchemaJsonPlugin(): Plugin {
  return {
    name: "survey-schema-json",
    buildStart() {
      try {
        execSync("npx tsx scripts/generate-schema-json.ts", {
          stdio: "inherit",
          cwd: process.cwd(),
        });
      } catch {
        console.warn("⚠️ Could not regenerate umfrage-schema.json");
      }
    },
  };
}

/**
 * Vite plugin: syncs public/data/nav.json from the Google Sheet
 * at every dev-server start and production build.
 */
function navJsonSyncPlugin(): Plugin {
  return {
    name: "nav-json-sync",
    buildStart() {
      try {
        execSync("npx tsx scripts/sync-nav-json.ts", {
          stdio: "inherit",
          cwd: process.cwd(),
        });
      } catch {
        console.warn("⚠️ Could not sync nav.json from Google Sheet");
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    surveySchemaJsonPlugin(),
    navJsonSyncPlugin(),
  ].filter(Boolean),
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    copyPublicDir: true,
  },
}));
