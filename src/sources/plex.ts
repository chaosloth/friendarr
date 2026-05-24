import axios from "axios";
import { PassThrough } from "stream";
import { logger } from "../logger";
import { config } from "../config";
import type { DownloadRequest } from "../types";

interface PlexPart {
  key: string;
  file: string;
  size: number;
}

interface PlexMetadata {
  ratingKey: string;
  Media: { id: number; duration: number; Part: PlexPart[] }[];
}

interface PlexMetadataResponse {
  MediaContainer: { Metadata: [PlexMetadata] };
}

export async function downloadFromPlex(request: DownloadRequest): Promise<{
  stream: NodeJS.ReadableStream;
  fileName: string;
  contentLength: number;
}> {
  const { url, authToken, ratingKey } = request.source;

  if (!ratingKey) {
    throw new Error("ratingKey is required for Plex source");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": config.userAgent,
  };
  if (authToken) {
    headers["X-Plex-Token"] = authToken;
  }

  logger.info(`Resolving media parts for ratingKey: ${ratingKey}`, "Plex");

  const metadataUrl = `${url.replace(/\/$/, "")}/library/metadata/${ratingKey}?includeMedia=1`;

  const metadataResponse = await axios.get<PlexMetadataResponse>(metadataUrl, {
    headers,
    timeout: 30000,
  });

  const metadata = metadataResponse.data.MediaContainer.Metadata[0];

  if (!metadata?.Media?.[0]?.Part?.length) {
    throw new Error("No media parts found for this item");
  }

  const parts = metadata.Media[0].Part;
  const totalSize = parts.reduce((sum, p) => sum + p.size, 0);

  logger.info(
    `Found ${parts.length} part(s), total size: ${totalSize}`,
    "Plex",
  );

  if (parts.length === 1) {
    const part = parts[0];
    const downloadUrl = `${url.replace(/\/$/, "")}${part.key}?download=1`;

    logger.info(`Downloading single Plex part: ${part.key}`, "Plex");

    const response = await axios.get(downloadUrl, {
      headers: { ...headers, Accept: "*/*" },
      responseType: "stream",
      timeout: 0,
    });

    const ext = part.file.split(".").pop() ?? "mkv";

    return {
      stream: response.data as NodeJS.ReadableStream,
      fileName: `${request.destination.title}.${ext}`,
      contentLength: parseInt(
        (response.headers["content-length"] as string) ?? `${part.size}`,
        10,
      ),
    };
  }

  // Multi-part: concatenate
  const combined = new PassThrough();

  void (async () => {
    try {
      for (const part of parts) {
        const downloadUrl = `${url.replace(/\/$/, "")}${part.key}?download=1`;

        const response = await axios.get(downloadUrl, {
          headers: { ...headers, Accept: "*/*" },
          responseType: "stream",
          timeout: 0,
        });

        await new Promise<void>((resolve, reject) => {
          response.data.pipe(combined, { end: false });
          response.data.on("end", () => {
            resolve();
          });
          response.data.on("error", reject);
        });
      }
      combined.end();
    } catch (e) {
      combined.destroy(e as Error);
    }
  })();

  const ext = parts[0].file.split(".").pop() ?? "mkv";

  return {
    stream: combined,
    fileName: `${request.destination.title}.${ext}`,
    contentLength: totalSize,
  };
}
