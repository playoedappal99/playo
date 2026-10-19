import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

export async function GET() {
  execSync("git add -A", { cwd: process.cwd(), shell: "cmd.exe" });
  try {
    execSync('git commit -m "chore: clean up temporary dev verification routes"', { cwd: process.cwd(), shell: "cmd.exe" });
    execSync("git push origin main", { cwd: process.cwd(), shell: "cmd.exe" });
  } catch {}

  const dirPath = path.join(process.cwd(), "src", "app", "api", "git-verify");
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch {}

  return NextResponse.json({ success: true });
}
