import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const rootDir = fileURLToPath(new URL("../", import.meta.url));

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function row(file) {
  const data = readFileSync(file);
  return {
    path: relative(rootDir, file).replaceAll("\\", "/"),
    raw: data.length,
    gzip: gzipSync(data, { level: 9 }).length,
  };
}

const allFiles = walk(distDir);
const htmlFiles = allFiles.filter((f) => f.endsWith(".html")).map(row).sort((a, b) => b.raw - a.raw);
const cssFiles = allFiles.filter((f) => f.endsWith(".css")).map(row).sort((a, b) => b.raw - a.raw);
const jsFiles = allFiles.filter((f) => f.endsWith(".js")).map(row).sort((a, b) => b.raw - a.raw);

const totalDistBytes = allFiles.reduce((sum, file) => sum + statSync(file).size, 0);

console.log(`dist total: ${bytes(totalDistBytes)} (${allFiles.length} files)`);
console.log("");

for (const [label, files] of [
  ["Largest HTML", htmlFiles.slice(0, 8)],
  ["CSS assets", cssFiles.slice(0, 8)],
  ["JS assets", jsFiles.slice(0, 8)],
]) {
  console.log(label);
  if (files.length === 0) {
    console.log("  (none)");
    console.log("");
    continue;
  }
  for (const file of files) {
    console.log(`  ${file.path}`);
    console.log(`    raw: ${bytes(file.raw)} | gzip: ${bytes(file.gzip)}`);
  }
  console.log("");
}
