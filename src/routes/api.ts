import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import {
  authenticateApiKey,
  authenticateMasterKey,
  createApiKey,
  deleteApiKey,
  listApiKeys,
} from '../auth';
import { downloadQueue } from '../lib/queue';
import { testWebhook } from '../lib/webhooks';
import { getLogs, logger } from '../logger';
import { getSettings, updateSettings } from '../settings';

const router: Router = Router();

router.post('/download', authenticateApiKey, (req, res) => {
  const body = req.body;

  if (!body.source?.type || !body.source?.url) {
    res.status(400).json({ error: 'source.type and source.url are required' });
    return;
  }

  if (!body.destination?.mediaType || !body.destination?.tmdbId) {
    res.status(400).json({
      error: 'destination.mediaType and destination.tmdbId are required',
    });
    return;
  }

  const job = downloadQueue.enqueue(body);

  logger.debug(
    `Download request: ${body.source.type} → ${body.destination.title || 'unknown'} (tmdb:${body.destination.tmdbId})`,
    'API'
  );

  res.status(202).json({
    id: job.id,
    status: job.status,
    progress: 0,
    bytesDownloaded: 0,
    totalBytes: 0,
  });
});

router.get('/status/:downloadId', authenticateApiKey, (req, res) => {
  const job = downloadQueue.getStatus(req.params.downloadId);

  if (!job) {
    res.status(404).json({ error: 'Download not found' });
    return;
  }

  res.status(200).json(job);
});

router.post('/api-keys', authenticateMasterKey, (req, res) => {
  const { label } = req.body;

  if (!label) {
    res.status(400).json({ error: 'label is required' });
    return;
  }

  const apiKey = createApiKey(label);
  logger.info(`API key created: ${label}`, 'API');
  res.status(201).json({ apiKey: apiKey.key });
});

router.get('/api-keys', authenticateMasterKey, (_req, res) => {
  const keys = listApiKeys();
  res.status(200).json({ keys });
});

router.delete('/api-keys/:key', authenticateMasterKey, (req, res) => {
  const deleted = deleteApiKey(req.params.key);

  if (!deleted) {
    res.status(404).json({ error: 'API key not found' });
    return;
  }

  logger.info(`API key revoked`, 'API');
  res.status(204).send();
});

router.get('/queue', authenticateMasterKey, (_req, res) => {
  const jobs = downloadQueue.listJobs();
  res.status(200).json({ jobs, globalPaused: downloadQueue.isGlobalPaused() });
});

router.post('/queue/:id/pause', authenticateMasterKey, (req, res) => {
  const ok = downloadQueue.pauseJob(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.status(200).json({ status: 'paused' });
});

router.post('/queue/:id/resume', authenticateMasterKey, (req, res) => {
  const ok = downloadQueue.resumeJob(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.status(200).json({ status: 'resumed' });
});

router.delete('/queue/:id', authenticateMasterKey, (req, res) => {
  const ok = downloadQueue.cancelJob(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  res.status(200).json({ status: 'cancelled' });
});

router.delete('/queue', authenticateMasterKey, (_req, res) => {
  const count = downloadQueue.clearCompleted();
  logger.info(`Cleared ${count} completed/failed jobs`, 'Queue');
  res.status(200).json({ cleared: count });
});

router.post('/queue/pause-all', authenticateMasterKey, (_req, res) => {
  downloadQueue.setGlobalPaused(true);
  logger.info('Queue globally paused', 'Queue');
  res.status(200).json({ globalPaused: true });
});

router.post('/queue/resume-all', authenticateMasterKey, (_req, res) => {
  downloadQueue.setGlobalPaused(false);
  logger.info('Queue globally resumed', 'Queue');
  res.status(200).json({ globalPaused: false });
});

router.get('/settings', authenticateMasterKey, (_req, res) => {
  res.status(200).json(getSettings());
});

router.put('/settings', authenticateMasterKey, (req, res) => {
  const updated = updateSettings(req.body);
  const changed = Object.keys(req.body).filter((k) => req.body[k] !== undefined);
  const scheduleChanged = changed.includes('schedules');
  const logLevelChanged = changed.includes('logLevel');

  logger.info(
    `Settings updated: ${changed.join(', ') || 'no fields'}`,
    'Settings'
  );

  if (scheduleChanged) {
    const schedules = updated.schedules;
    const totalWindows = schedules.reduce((sum, s) => sum + s.windows.length, 0);
    if (schedules.length === 0) {
      logger.info('Schedule removed: downloads now unrestricted', 'Settings');
    } else {
      logger.info(
        `Schedule updated: ${schedules.length} day(s), ${totalWindows} window(s)`,
        'Settings'
      );
    }
  }

  if (logLevelChanged) {
    logger.info(`Log level changed to ${updated.logLevel}`, 'Settings');
  }

  logger.debug(
    `Settings detail: ${JSON.stringify(req.body)}`,
    'Settings'
  );
  downloadQueue.triggerProcess();
  res.status(200).json(updated);
});

router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    activeDownloads: downloadQueue.getActiveCount(),
  });
});

router.get('/verify', authenticateApiKey, (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/logs', authenticateMasterKey, (req, res) => {
  const level = req.query.level as string | undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
  res.status(200).json({ logs: getLogs(level, limit) });
});

router.post('/webhooks/test', authenticateMasterKey, async (req, res) => {
  const { url, secret } = req.body;
  if (!url) {
    res.status(400).json({ error: 'url is required' });
    return;
  }
  try {
    logger.debug(`Webhook test: ${url}`, 'Webhooks');
    await testWebhook(url, secret);
    logger.info(`Webhook test to ${url} succeeded`, 'Webhooks');
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    res.status(502).json({
      status: 'failed',
      error: (e as Error).message,
    });
  }
});

router.get('/browse', authenticateMasterKey, async (req, res) => {
  const dirPath = (req.query.path as string) || '/';
  try {
    const resolved = path.resolve(dirPath);
    logger.debug(`Directory browsed: ${resolved}`, 'API');
    const entries = await fs.readdir(resolved, { withFileTypes: true });
    const listing = entries
      .filter((e) => e.isDirectory())
      .map((e) => ({
        name: e.name,
        isDirectory: true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json({
      path: resolved,
      entries: listing,
    });
  } catch (e) {
    res.status(400).json({
      error: `Cannot read directory: ${(e as Error).message}`,
    });
  }
});

export default router;
