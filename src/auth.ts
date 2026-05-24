import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { config } from "./config";
import type { ApiKey } from "./types";
import { logger } from "./logger";

const apiKeys = new Map<string, Omit<ApiKey, "key">>();
const keysFilePath = path.join(config.dataDir, "api-keys.json");

function loadApiKeys(): void {
  try {
    const raw = fs.readFileSync(keysFilePath, "utf-8");
    const entries: { key: string; label: string; createdAt: string }[] =
      JSON.parse(raw);
    for (const e of entries) {
      apiKeys.set(e.key, { label: e.label, createdAt: new Date(e.createdAt) });
    }
    if (entries.length > 0)
      logger.info(`Loaded ${entries.length} API key(s) from disk`, "Auth");
  } catch {
    // first run, no file yet
  }
}

function saveApiKeys(): void {
  try {
    fs.mkdirSync(path.dirname(keysFilePath), { recursive: true });
    const entries = Array.from(apiKeys.entries()).map(([key, data]) => ({
      key,
      label: data.label,
      createdAt: data.createdAt.toISOString(),
    }));
    fs.writeFileSync(keysFilePath, JSON.stringify(entries, null, 2), "utf-8");
  } catch (err) {
    logger.warn("Failed to persist API keys to disk", "Auth");
  }
}

loadApiKeys();

export function createApiKey(label: string): ApiKey {
  const key = `sk-${crypto.randomBytes(24).toString("hex")}`;
  const apiKey: ApiKey = { key, label, createdAt: new Date() };
  apiKeys.set(key, { label, createdAt: apiKey.createdAt });
  saveApiKeys();
  return apiKey;
}

export function deleteApiKey(key: string): boolean {
  const deleted = apiKeys.delete(key);
  if (deleted) saveApiKeys();
  return deleted;
}

export function listApiKeys(): {
  key: string;
  label: string;
  createdAt: Date;
}[] {
  return Array.from(apiKeys.entries()).map(([key, data]) => ({
    key,
    label: data.label,
    createdAt: data.createdAt,
  }));
}

function isValidApiKey(key: string): boolean {
  if (!key) return false;
  return apiKeys.has(key) || key === config.masterKey;
}

export function authenticateApiKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  if (!isValidApiKey(token)) {
    logger.warn("Auth failed: invalid API key", "Auth");
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  logger.debug("Authenticated via API key", "Auth");
  next();
}

export function authenticateMasterKey(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  if (token !== config.masterKey) {
    logger.warn("Master key auth failed", "Auth");
    res.status(403).json({ error: "Invalid master key" });
    return;
  }

  next();
}
