import { copyFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { mkdir } from "fs/promises";

const src = join(process.cwd(), "app", "favicon.png");
const destDir = join(process.cwd(), "public");
const dest = join(destDir, "favicon.png");

async function main() {
  if (!existsSync(src)) {
    console.error("app/favicon.png not found. Skipping sync.");
    process.exit(0);
  }
  await mkdir(destDir, { recursive: true });
  await copyFile(src, dest);
  console.log("✅ Synced app/favicon.png -> public/favicon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

