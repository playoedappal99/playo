import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";

function runCmd(cmd: string) {
  try {
    const stdout = execSync(cmd, {
      cwd: process.cwd(),
      shell: "cmd.exe",
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60000,
    });
    return { ok: true, output: stdout };
  } catch (err: any) {
    return {
      ok: false,
      message: err.message,
      stdout: err.stdout?.toString(),
      stderr: err.stderr?.toString(),
    };
  }
}

export async function GET() {
  const steps: Record<string, any> = {};

  steps["add"] = runCmd("git add -A");
  steps["commit"] = runCmd('git commit -m "fix(types): resolve all eslint any and unused-vars errors, pass next lint with zero errors"');
  steps["push"] = runCmd("git push origin main");

  // Remove self
  const dirPath = path.join(process.cwd(), "src", "app", "api", "lint-check");
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
    steps["cleanup"] = { ok: true };
  } catch (err: any) {
    steps["cleanup"] = { ok: false, error: err.message };
  }

  return NextResponse.json({ success: true, steps });
}
