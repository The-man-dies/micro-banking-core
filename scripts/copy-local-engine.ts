import fs from "fs/promises";
import path from "path";

const clientDir = path.join(
  process.cwd(),
  "server",
  "node_modules",
  ".prisma",
  "client",
);

const destDir = path.join(process.cwd(), "desktop", "resources");

const ensureDir = async () => {
  await fs.mkdir(destDir, { recursive: true });
};

const copyIfExists = async (src: string, dest: string) => {
  await fs.access(src);
  await fs.copyFile(src, dest);
};

const main = async () => {
  const wasmSrc = path.join(clientDir, "query_compiler_fast_bg.wasm");
  const schemaSrc = path.join(clientDir, "schema.prisma");
  const wasmDest = path.join(destDir, "query_compiler_fast_bg.wasm");
  const schemaDest = path.join(destDir, "schema.prisma");

  try {
    await ensureDir();
    await copyIfExists(wasmSrc, wasmDest);
    await copyIfExists(schemaSrc, schemaDest);
  } catch {
    throw new Error("Run 'bunx prisma generate' in server/ first");
  }

  console.log(`Copied ${wasmSrc} -> ${wasmDest}`);
  console.log(`Copied ${schemaSrc} -> ${schemaDest}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
