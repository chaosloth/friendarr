import crypto from "crypto";
import https from "https";
import type { DownloadJob, Webhook } from "../types";
import { logger } from "../logger";
import { config } from "../config";

interface WebhookPayload {
  event: string;
  downloadId: string;
  timestamp: string;
  request: DownloadJob["request"];
  outputPath?: string;
  error?: string;
}

interface TestResult {
  statusCode: number;
  body: string;
}

function postJSON(
  urlStr: string,
  data: string,
  extraHeaders: Record<string, string> = {},
  timeout = 5000,
): Promise<TestResult> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const body = Buffer.from(data, "utf-8");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Content-Length": String(body.length),
      "User-Agent": config.userAgent,
      ...extraHeaders,
    };

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: "POST",
        family: 4,
        headers,
        timeout,
      },
      (res) => {
        let responseBody = "";
        res.setEncoding("utf-8");
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, body: responseBody });
          } else {
            reject(
              new Error(
                `HTTP ${res.statusCode}: ${responseBody || "no body"}`.substring(0, 500),
              ),
            );
          }
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.on("error", (err) => {
      reject(new Error(err.message));
    });

    req.write(body);
    req.end();
  });
}

export async function fireWebhooks(
  event: string,
  job: DownloadJob,
  webhooks: Webhook[],
): Promise<void> {
  const payload: WebhookPayload = {
    event,
    downloadId: job.id,
    timestamp: new Date().toISOString(),
    request: {
      ...job.request,
      source: {
        ...job.request.source,
        authToken: job.request.source.authToken ? "***" : undefined,
      },
    },
    outputPath: job.outputPath,
    error: job.error,
  };

  const body = JSON.stringify(payload);

  const targets = webhooks.filter((w) => w.enabled && w.events.includes(event));

  for (const webhook of targets) {
    const headers: Record<string, string> = {};

    if (webhook.secret) {
      headers["X-Friendarr-Signature"] = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");
    }

    try {
      logger.debug(`Webhook ${event} → ${webhook.url}`, "Webhooks");
      await postJSON(webhook.url, body, headers);
      logger.debug(`Webhook ${event} delivered to ${webhook.url}`, "Webhooks");
    } catch (e) {
      logger.warn(
        `Webhook delivery failed to ${webhook.url}: ${(e as Error).message}`,
        "Webhooks",
      );
    }
  }
}

export async function testWebhook(
  url: string,
  secret?: string,
): Promise<TestResult> {
  const payload = {
    event: "test",
    timestamp: new Date().toISOString(),
    message: "Friendarr webhook test",
  };
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {};

  if (secret) {
    headers["X-Friendarr-Signature"] = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
  }

  return postJSON(url, body, headers);
}
