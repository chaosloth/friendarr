import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { config } from '../config';

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getMoviePath(
  title: string,
  year: number,
  libraryPath?: string
): string {
  const base = libraryPath ?? path.join(config.libraryBasePath, 'movies');
  const folderName = sanitizeFilename(`${title} (${year})`);
  return path.join(base, folderName);
}

export function getShowPath(title: string, libraryPath?: string): string {
  const base = libraryPath ?? path.join(config.libraryBasePath, 'tv');
  const folderName = sanitizeFilename(title);
  return path.join(base, folderName);
}

export function getEpisodePath(
  showTitle: string,
  seasonNumber: number,
  episodeNumber: number,
  extension: string,
  libraryPath?: string
): string {
  const showPath = getShowPath(showTitle, libraryPath);
  const seasonFolder = path.join(
    showPath,
    `Season ${String(seasonNumber).padStart(2, '0')}`
  );
  const filename = sanitizeFilename(
    `${showTitle} - S${String(seasonNumber).padStart(2, '0')}E${String(
      episodeNumber
    ).padStart(2, '0')}.${extension}`
  );
  return path.join(seasonFolder, filename);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function writeFile(
  filePath: string,
  data: Buffer | NodeJS.ReadableStream
): Promise<void> {
  await ensureDir(path.dirname(filePath));

  if (Buffer.isBuffer(data)) {
    await fs.writeFile(filePath, data);
  } else {
    const writeStream = createWriteStream(filePath);
    await new Promise<void>((resolve, reject) => {
      data.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      data.on('error', reject);
    });
  }
}
