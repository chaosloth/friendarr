import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";

interface RouteInfo {
  method: string;
  path: string;
  auth: string;
  description: string;
  requestBody: string;
  responseBody: string;
}

function parseRoutes(): RouteInfo[] {
  const source = readFileSync(
    resolve(__dirname, "../src/routes/api.ts"),
    "utf-8",
  );

  const routes: RouteInfo[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    let method = "";
    let routePath = "";
    let auth = "";

    const routerMatch = line.match(
      /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"](,?)\s*(authenticateMasterKey|authenticateApiKey)?/,
    );
    if (!routerMatch) continue;

    method = routerMatch[1].toUpperCase();
    routePath = `/api/v1${routerMatch[2]}`;
    auth = routerMatch[4] ?? "none";

    if (routerMatch[3] === ",") {
      // Auth middleware might be separated by newlines
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const next = lines[j].trim();
        if (next === "authenticateMasterKey,") {
          auth = "authenticateMasterKey";
          break;
        }
        if (next === "authenticateApiKey,") {
          auth = "authenticateApiKey";
          break;
        }
      }
    }

    const authLevel =
      auth === "authenticateMasterKey"
        ? "Master key"
        : auth === "authenticateApiKey"
          ? "API key"
          : "None";

    routes.push({
      method,
      path: routePath,
      auth: authLevel,
      description: "",
      requestBody: "",
      responseBody: "",
    });
  }

  return routes;
}

const descriptions: Record<string, string> = {
  "POST /api/v1/download": "Queue a download from a remote media server",
  "GET /api/v1/status/:downloadId": "Get the status and progress of a download",
  "POST /api/v1/api-keys": "Create a new API key",
  "GET /api/v1/api-keys": "List all API keys",
  "DELETE /api/v1/api-keys/:key": "Revoke an API key",
  "GET /api/v1/queue": "List all queued and completed jobs",
  "POST /api/v1/queue/pause-all": "Pause all queue processing",
  "POST /api/v1/queue/resume-all": "Resume all queue processing",
  "POST /api/v1/queue/:id/pause": "Pause a specific job",
  "POST /api/v1/queue/:id/resume": "Resume a paused job",
  "DELETE /api/v1/queue/:id": "Cancel a specific job",
  "DELETE /api/v1/queue": "Clear all completed and failed jobs",
  "GET /api/v1/settings": "Get current runtime settings",
  "PUT /api/v1/settings": "Update runtime settings",
  "GET /api/v1/health": "Health check with active download count",
  "GET /api/v1/verify": "Verify an API key is valid",
  "GET /api/v1/logs": "Get buffered log entries",
  "POST /api/v1/webhooks/test": "Test a webhook URL",
};

const requestBodies: Record<string, string> = {
  "POST /api/v1/download": `\`\`\`json
{
  "source": { "type": "plex", "url": "...", "authToken": "...", "ratingKey": "..." },
  "destination": { "mediaType": "movie", "tmdbId": 680, "title": "...", "year": 2024 }
}
\`\`\``,
  "POST /api/v1/api-keys": `\`\`\`json
{ "label": "My API Key" }
\`\`\``,
  "PUT /api/v1/settings": `\`\`\`json
{ "maxConcurrentDownloads": 4, "testMode": false }
\`\`\``,
  "POST /api/v1/webhooks/test": `\`\`\`json
{ "url": "https://hooks.example.com/endpoint", "secret": "optional-hmac-key" }
\`\`\``,
};

const responseBodies: Record<string, string> = {
  "POST /api/v1/download": `\`\`\`json
{ "id": "uuid", "status": "queued", "progress": 0, "bytesDownloaded": 0, "totalBytes": 0 }
\`\`\``,
  "GET /api/v1/status/:downloadId": `\`\`\`json
{
  "id": "uuid",
  "status": "downloading",
  "progress": 45,
  "bytesDownloaded": 450000000,
  "totalBytes": 1000000000,
  "request": { "source": {...}, "destination": {...} },
  "createdAt": "2026-01-01T00:00:00.000Z"
}
\`\`\``,
  "POST /api/v1/api-keys": `\`\`\`json
{ "apiKey": "sk-abc123..." }
\`\`\``,
  "GET /api/v1/api-keys": `\`\`\`json
{ "keys": [{ "key": "sk-...", "label": "...", "createdAt": "..." }] }
\`\`\``,
  "GET /api/v1/queue": `\`\`\`json
{ "jobs": [...], "globalPaused": false }
\`\`\``,
  "GET /api/v1/settings": `\`\`\`json
{ "maxConcurrentDownloads": 2, "maxBandwidth": 0, "schedules": [], ... }
\`\`\``,
  "GET /api/v1/health": `\`\`\`json
{ "status": "ok", "activeDownloads": 1 }
\`\`\``,
  "GET /api/v1/verify": `\`\`\`json
{ "status": "ok" }
\`\`\``,
  "GET /api/v1/logs": `\`\`\`json
{ "logs": [{ "timestamp": "...", "level": "info", "label": "Queue", "message": "..." }] }
\`\`\``,
  "POST /api/v1/webhooks/test": `\`\`\`json
{ "status": "ok" }
\`\`\``,
};

function categoryFor(path: string): string {
  if (path.includes("/download") || path.includes("/status"))
    return "downloads";
  if (path.includes("/queue")) return "queue";
  if (path.includes("/api-keys")) return "api-keys";
  if (path.includes("/settings")) return "settings";
  if (path.includes("/webhooks")) return "webhooks";
  if (path.includes("/logs")) return "logs";
  if (path.includes("/health")) return "health";
  if (path.includes("/verify")) return "auth";
  return "other";
}

const categoryNames: Record<string, string> = {
  downloads: "Downloads",
  queue: "Queue Management",
  "api-keys": "API Keys",
  settings: "Settings",
  webhooks: "Webhooks",
  logs: "Logs",
  health: "Health & Auth",
  auth: "Health & Auth",
};

function generateMarkdown(): string {
  const routes = parseRoutes();

  for (const r of routes) {
    const key = `${r.method} ${r.path}`;
    r.description = descriptions[key] ?? "";
    r.requestBody = requestBodies[key] ?? "";
    r.responseBody = responseBodies[key] ?? "";
  }

  const categories = new Map<string, RouteInfo[]>();
  for (const r of routes) {
    const cat = categoryFor(r.path);
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(r);
  }

  let md = "# API Endpoints\n\n";

  // Download endpoint detailed section
  const downloads = categories.get("downloads");
  if (downloads) {
    md += "## Download\n\n";
    md += "### Queue a Download\n\n";
    md += "`POST /api/v1/download` &mdash; API key required\n\n";
    md +=
      "Queues a media file for download from a remote Plex, Emby, or Jellyfin server.\n\n";
    md += "**Request Body**\n\n";
    md += "```json\n";
    md += "{\n";
    md += '  "source": {\n';
    md += '    "type": "plex",\n';
    md += '    "url": "http://192.168.1.100:32400",\n';
    md += '    "authToken": "plex-token",\n';
    md += '    "ratingKey": "12345"\n';
    md += "  },\n";
    md += '  "destination": {\n';
    md += '    "mediaType": "movie",\n';
    md += '    "tmdbId": 680,\n';
    md += '    "title": "Pulp Fiction",\n';
    md += '    "year": 1994\n';
    md += "  },\n";
    md += '  "metadata": {\n';
    md += '    "nfo": true,\n';
    md += '    "poster": true,\n';
    md += '    "fanart": true\n';
    md += "  }\n";
    md += "}\n";
    md += "```\n\n";
    md += "**Response** `202 Accepted`\n\n";
    md += "```json\n";
    md += "{\n";
    md += '  "id": "download-uuid",\n';
    md += '  "status": "queued",\n';
    md += '  "progress": 0,\n';
    md += '  "bytesDownloaded": 0,\n';
    md += '  "totalBytes": 0\n';
    md += "}\n";
    md += "```\n\n";

    md += "### Get Download Status\n\n";
    md += "`GET /api/v1/status/:downloadId` &mdash; API key required\n\n";
    md += "Polls the current status and progress of a download job.\n\n";
    md += "**Response** `200 OK`\n\n";
    md += "```json\n";
    md += "{\n";
    md += '  "id": "download-uuid",\n';
    md += '  "status": "downloading",\n';
    md += '  "progress": 45,\n';
    md += '  "bytesDownloaded": 450000000,\n';
    md += '  "totalBytes": 1000000000,\n';
    md += '  "request": { "source": {...}, "destination": {...} },\n';
    md += '  "createdAt": "2026-01-01T00:00:00.000Z"\n';
    md += "}\n";
    md += "```\n\n";
    md += "Status values: `queued`, `downloading`, `complete`, `failed`.\n\n";
  }

  md += "## All Endpoints\n\n";

  for (const [cat, catRoutes] of categories) {
    if (cat === "downloads") continue;
    md += `### ${categoryNames[cat] ?? cat}\n\n`;
    md += "| Method | Path | Auth |\n";
    md += "|---|---|---|\n";
    for (const r of catRoutes) {
      md += `| ${r.method} | \`${r.path}\` | ${r.auth} |\n`;
    }
    md += "\n";

    for (const r of catRoutes) {
      if (r.description) {
        md += `#### ${r.method} ${r.path}\n\n${r.description}.\n\n`;
        if (r.requestBody) {
          md += `**Request**\n\n${r.requestBody}\n\n`;
        }
        if (r.responseBody) {
          md += `**Response**\n\n${r.responseBody}\n\n`;
        }
      }
    }
  }

  return md;
}

const outDir = resolve(__dirname, "../docs/api");
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}
const outPath = resolve(outDir, "_generated.md");
writeFileSync(outPath, generateMarkdown(), "utf-8");
console.log(`Generated ${outPath}`);
