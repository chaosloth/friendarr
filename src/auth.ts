import type { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { config } from './config';
import type { ApiKey } from './types';
import { logger } from './logger';

const apiKeys = new Map<string, Omit<ApiKey, 'key'>>();

export function createApiKey(label: string): ApiKey {
  const key = `sk-${crypto.randomBytes(24).toString('hex')}`;
  const apiKey: ApiKey = { key, label, createdAt: new Date() };
  apiKeys.set(key, { label, createdAt: apiKey.createdAt });
  return apiKey;
}

export function deleteApiKey(key: string): boolean {
  return apiKeys.delete(key);
}

export function listApiKeys(): { key: string; label: string; createdAt: Date }[] {
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
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  if (!isValidApiKey(token)) {
    logger.warn('Auth failed: invalid API key', 'Auth');
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  logger.debug('Authenticated via API key', 'Auth');
  next();
}

export function authenticateMasterKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  if (token !== config.masterKey) {
    logger.warn('Master key auth failed', 'Auth');
    res.status(403).json({ error: 'Invalid master key' });
    return;
  }

  next();
}
