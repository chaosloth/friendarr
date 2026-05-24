import fs from "fs";
import path from "path";
import { config } from "./config";
import { logger } from "./logger";

function resolvePath(filename: string): string {
  const dir = config.dataDir;
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

export function loadJSON<T>(filename: string, fallback: T): T {
  try {
    const filePath = resolvePath(filename);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(filename: string, data: unknown): void {
  try {
    const filePath = resolvePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    logger.warn(`Failed to persist ${filename}: ${(err as Error).message}`, "Storage");
  }
}

const MAX_LOG_FILE_BYTES = 1_048_576; // 1 MB

export function appendLogLine(line: string): void {
  try {
    const filePath = resolvePath("friendarr.log");
    fs.appendFileSync(filePath, line + "\n", "utf-8");

    const stat = fs.statSync(filePath);
    if (stat.size > MAX_LOG_FILE_BYTES) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      const trimmed = lines.slice(-Math.floor(lines.length / 2)).join("\n");
      fs.writeFileSync(filePath, trimmed + "\n", "utf-8");
    }
  } catch {
    // silent — log persistence is best-effort
  }
}

export function readLogTail(maxLines: number): string[] {
  try {
    const filePath = resolvePath("friendarr.log");
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter((l) => l.length > 0);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}
