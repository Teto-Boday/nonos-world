// Builds the web app into dist/app and copies the download site into dist/
import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync, readdirSync } from "node:fs";
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist/app", { recursive: true });
await build({ entryPoints: ["web/main.js"], bundle: true, minify: true, format: "esm", target: "es2020", outfile: "dist/app/main.js" });
for (const f of readdirSync("web")) {
  if (/\.(html|css|svg|png|webmanifest)$/.test(f) && f !== "test.html") cpSync(`web/${f}`, `dist/app/${f}`);
}
cpSync("site", "dist", { recursive: true });
console.log("built dist/");
