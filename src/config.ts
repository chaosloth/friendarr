import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

function readCommitTag(): { version: string; commitTag: string } {
  try {
    const data = fs.readFileSync(
      path.join(process.cwd(), "committag.json"),
      "utf-8",
    );
    return JSON.parse(data);
  } catch {
    return { version: "dev", commitTag: "unknown" };
  }
}

const commitInfo = readCommitTag();
if (commitInfo.version.startsWith("v")) {
  commitInfo.version = commitInfo.version.slice(1);
}

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "config");

function loadMasterKey(): string {
  const envKey = process.env.API_KEY ?? "";
  if (envKey) return envKey;
  try {
    const keyPath = path.join(dataDir, "master-key.json");
    if (fs.existsSync(keyPath)) {
      const data = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
      return data.masterKey ?? "";
    }
  } catch {
    // no saved key yet
  }
  return "";
}

export const config = {
  version: commitInfo.version,
  commitTag: commitInfo.commitTag,
  port: parseInt(process.env.PORT ?? "5056", 10),
  masterKey: loadMasterKey(),
  incompletePath: process.env.INCOMPLETE_PATH ?? "/downloads/incomplete",
  completedPath: process.env.COMPLETED_PATH ?? "/downloads/complete",
  maxConcurrentDownloads: parseInt(
    process.env.MAX_CONCURRENT_DOWNLOADS ?? "2",
    10,
  ),
  debug: process.env.DEBUG === "true",
  logBufferSize: parseInt(process.env.LOG_BUFFER_SIZE ?? "500", 10),
  dataDir,
  moviePath: process.env.MOVIE_PATH ?? "",
  tvPath: process.env.TV_PATH ?? "",
};
