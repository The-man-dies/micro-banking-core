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
const prismaClientDest = path.join(destDir, "prisma-client");

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

  await ensureDir();
  await copyIfExists(wasmSrc, wasmDest).catch(() => {
    console.warn("Prisma wasm asset missing; skipping copy.");
  });
  await copyIfExists(schemaSrc, schemaDest);
  const clientStat = await fs.stat(clientDir).catch(() => null);
  if (!clientStat) {
    throw new Error("Prisma client build missing; run 'bunx prisma generate' in server/ first");
  }
  await fs.rm(prismaClientDest, { recursive: true, force: true });
  await fs.cp(clientDir, prismaClientDest, { recursive: true });

  console.log(`Copied ${wasmSrc} -> ${wasmDest}`);
  console.log(`Copied ${schemaSrc} -> ${schemaDest}`);
  console.log(`Copied Prisma client artifacts -> ${prismaClientDest}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
