import crypto from 'crypto';
import axios from 'axios';
import type { DownloadJob, Webhook } from '../types';
import { logger } from '../logger';

interface WebhookPayload {
  event: string;
  downloadId: string;
  timestamp: string;
  request: DownloadJob['request'];
  outputPath?: string;
  error?: string;
}

export async function fireWebhooks(
  event: string,
  job: DownloadJob,
  webhooks: Webhook[]
): Promise<void> {
  const payload: WebhookPayload = {
    event,
    downloadId: job.id,
    timestamp: new Date().toISOString(),
    request: {
      ...job.request,
      source: {
        ...job.request.source,
        authToken: job.request.source.authToken ? '***' : undefined,
      },
    },
    outputPath: job.outputPath,
    error: job.error,
  };

  const body = JSON.stringify(payload);

  const targets = webhooks.filter(
    (w) => w.enabled && w.events.includes(event)
  );

  for (const webhook of targets) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhook.secret) {
      headers['X-Friendarr-Signature'] = crypto
        .createHmac('sha256', webhook.secret)
        .update(body)
        .digest('hex');
    }

    try {
      await axios.post(webhook.url, body, {
        headers,
        timeout: 5000,
      });
    } catch (e) {
      logger.warn(
        `Webhook delivery failed to ${webhook.url}: ${(e as Error).message}`,
        'Webhooks'
      );
    }
  }
}

export async function testWebhook(url: string, secret?: string): Promise<void> {
  const payload = {
    event: 'test',
    timestamp: new Date().toISOString(),
    message: 'Friendarr webhook test',
  };
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (secret) {
    headers['X-Friendarr-Signature'] = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  await axios.post(url, body, { headers, timeout: 5000 });
}
