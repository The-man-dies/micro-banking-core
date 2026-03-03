import fs from "fs/promises";
import path from "path";
import { spawnSync } from "child_process";

const ROOT = process.cwd();
const SERVER_DIR = path.join(ROOT, "server");
const DESKTOP_DIR = path.join(ROOT, "desktop");
const SERVER_RESOURCE_DIR = path.join(DESKTOP_DIR, "resources", "server");
const DESKTOP_BIN_DIR = path.join(DESKTOP_DIR, "binaries");

const run = (cmd: string, args: string[], cwd: string) => {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")} (cwd=${cwd})`);
  }
};

const bunSidecarNameForHost = (): string => {
  const arch = process.arch;
  if (process.platform === "win32") {
    if (arch === "x64") return "bun-x86_64-pc-windows-msvc.exe";
    if (arch === "arm64") return "bun-aarch64-pc-windows-msvc.exe";
    throw new Error(`Unsupported Windows arch: ${arch}`);
  }
  if (process.platform === "linux") {
    if (arch === "x64") return "bun-x86_64-unknown-linux-gnu";
    if (arch === "arm64") return "bun-aarch64-unknown-linux-gnu";
    throw new Error(`Unsupported Linux arch: ${arch}`);
  }
  if (process.platform === "darwin") {
    if (arch === "x64") return "bun-x86_64-apple-darwin";
    if (arch === "arm64") return "bun-aarch64-apple-darwin";
    throw new Error(`Unsupported macOS arch: ${arch}`);
  }
  throw new Error(`Unsupported platform: ${process.platform}`);
};

const copyIfExists = async (src: string, dest: string) => {
  try {
    await fs.access(src);
    await fs.copyFile(src, dest);
  } catch {
    // Optional file, no-op if missing.
  }
};

const ensureBackendBuild = async () => {
  run("bun", ["install"], SERVER_DIR);
  run("bun", ["run", "build"], SERVER_DIR);
};

const stageServerRuntime = async () => {
  await fs.rm(SERVER_RESOURCE_DIR, { recursive: true, force: true });
  await fs.mkdir(path.join(SERVER_RESOURCE_DIR, "prisma"), { recursive: true });

  await fs.cp(path.join(SERVER_DIR, "dist"), path.join(SERVER_RESOURCE_DIR, "dist"), {
    recursive: true,
  });
  await fs.cp(
    path.join(SERVER_DIR, "node_modules"),
    path.join(SERVER_RESOURCE_DIR, "node_modules"),
    { recursive: true },
  );
  await fs.cp(
    path.join(SERVER_DIR, "prisma", "migrations"),
    path.join(SERVER_RESOURCE_DIR, "prisma", "migrations"),
    { recursive: true },
  );
  await copyIfExists(path.join(SERVER_DIR, ".env"), path.join(SERVER_RESOURCE_DIR, ".env"));
};

const stageBunSidecar = async () => {
  const bunExecutable = process.execPath;
  const sidecarName = bunSidecarNameForHost();

  await fs.mkdir(DESKTOP_BIN_DIR, { recursive: true });
  const entries = await fs.readdir(DESKTOP_BIN_DIR).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => entry.startsWith("bun-"))
      .map((entry) => fs.rm(path.join(DESKTOP_BIN_DIR, entry), { force: true })),
  );

  const target = path.join(DESKTOP_BIN_DIR, sidecarName);
  await fs.copyFile(bunExecutable, target);
  if (process.platform !== "win32") {
    await fs.chmod(target, 0o755);
  }
};

const main = async () => {
  await ensureBackendBuild();
  await stageServerRuntime();
  await stageBunSidecar();
  console.log("Tauri runtime staged: backend dist/node_modules + Bun sidecar.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
