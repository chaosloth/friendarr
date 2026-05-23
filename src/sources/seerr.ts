import axios from 'axios';
import { logger } from '../logger';
import type { DownloadRequest } from '../types';

export async function downloadFromSeerr(request: DownloadRequest): Promise<{
  stream: NodeJS.ReadableStream;
  fileName: string;
  contentLength: number;
}> {
  const { url, authToken, mediaId } = request.source;

  if (!mediaId) {
    throw new Error('mediaId is required for Seerr source');
  }

  const downloadUrl = `${url.replace(/\/$/, '')}/api/v1/media/${mediaId}/download`;

  logger.info(`Downloading from Seerr: ${downloadUrl}`, 'Seerr');

  const response = await axios.get(downloadUrl, {
    headers: authToken ? { 'X-Api-Key': authToken } : {},
    responseType: 'stream',
    timeout: 0,
  });

  const contentDisposition = response.headers['content-disposition'] as
    | string
    | undefined;
  let fileName = `${request.destination.title}.mkv`;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match) {
      fileName = match[1];
    }
  }

  return {
    stream: response.data as NodeJS.ReadableStream,
    fileName,
    contentLength: parseInt(
      (response.headers['content-length'] as string) ?? '0',
      10
    ),
  };
}
