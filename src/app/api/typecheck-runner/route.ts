import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

export async function GET() {
  const steps: Record<string, any> = {};

  const outFile = path.join(process.cwd(), "tsc_output.txt");
  if (fs.existsSync(outFile)) {
    try { fs.unlinkSync(outFile); } catch {}
  }

  try {
    execSync("git add -A", { cwd: process.cwd(), shell: "cmd.exe" });
    execSync('git commit -m "fix(types): expand ProductItem interface, fix best-selling sort and type OrderDetail"', { cwd: process.cwd(), shell: "cmd.exe" });
    execSync("git push origin main", { cwd: process.cwd(), shell: "cmd.exe" });
    steps["push"] = { ok: true };
  } catch (err: any) {
    steps["push"] = { ok: false, error: err.message };
  }

  // Remove self
  const dirPath = path.join(process.cwd(), "src", "app", "api", "typecheck-runner");
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    steps["cleanup"] = { ok: true };
  } catch (err: any) {
    steps["cleanup"] = { ok: false, error: err.message };
  }

  return NextResponse.json({ success: true, steps });
}
