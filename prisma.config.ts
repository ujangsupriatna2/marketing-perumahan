import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  seed: {
    filePath: path.join(__dirname, "prisma", "seed.ts"),
  },
});
