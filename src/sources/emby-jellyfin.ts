import axios from "axios";
import { logger } from "../logger";
import { config } from "../config";
import type { DownloadRequest } from "../types";

export async function downloadFromEmbyJellyfin(
  request: DownloadRequest,
): Promise<{
  stream: NodeJS.ReadableStream;
  fileName: string;
  contentLength: number;
}> {
  const { url, authToken, deviceId, mediaId } = request.source;

  if (!mediaId) {
    throw new Error("mediaId is required for Emby/Jellyfin source");
  }

  const safeDeviceId =
    deviceId && deviceId.length > 0
      ? deviceId
      : Buffer.from("BOT_friendarr").toString("base64");

  const downloadUrl = `${url.replace(/\/$/, "")}/Items/${mediaId}/Download`;

  logger.info(`Downloading from Emby/Jellyfin: ${downloadUrl}`, "EmbyJellyfin");

  const headers: Record<string, string> = {
    "User-Agent": config.userAgent,
  };
  if (authToken) {
    headers["Authorization"] =
      `MediaBrowser Client="Seerr", Device="Seerr", DeviceId="${safeDeviceId}", Version="1.0.0", Token="${authToken}"`;
  }

  const response = await axios.get(downloadUrl, {
    headers,
    responseType: "stream",
    timeout: 0,
    validateStatus: (status) => status < 400,
  });

  const contentDisposition = response.headers["content-disposition"] as
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
      (response.headers["content-length"] as string) ?? "0",
      10,
    ),
  };
}
