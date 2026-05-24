import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { config } from '../config';
import { getSettings } from '../settings';
import { logger } from '../logger';

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getMoviePath(
  title: string,
  year: number,
  libraryPath?: string,
  completedPath?: string
): string {
  const settings = getSettings();
  const base =
    libraryPath ??
    (settings.moviePath ||
    path.join(completedPath ?? config.completedPath, 'movies'));
  const folderName = sanitizeFilename(`${title} (${year})`);
  return path.join(base, folderName);
}

export function getShowPath(
  title: string,
  libraryPath?: string,
  completedPath?: string
): string {
  const settings = getSettings();
  const base =
    libraryPath ??
    (settings.tvPath ||
    path.join(completedPath ?? config.completedPath, 'tv'));
  const folderName = sanitizeFilename(title);
  return path.join(base, folderName);
}

export function getEpisodePath(
  showTitle: string,
  seasonNumber: number,
  episodeNumber: number,
  extension: string,
  libraryPath?: string,
  completedPath?: string
): string {
  const showPath = getShowPath(showTitle, libraryPath, completedPath);
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
  logger.debug(`Writing file: ${filePath}`, 'FilePlacer');

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

export async function linkFile(
  sourcePath: string,
  destPath: string
): Promise<void> {
  await ensureDir(path.dirname(destPath));
  try {
    await fs.link(sourcePath, destPath);
    logger.debug(`Hard-linked: ${sourcePath} → ${destPath}`, 'FilePlacer');
  } catch (e: unknown) {
    if (
      typeof e === 'object' &&
      e !== null &&
      'code' in e &&
      (e as NodeJS.ErrnoException).code === 'EXDEV'
    ) {
      logger.debug('Hard link failed (cross-device), copying instead', 'FilePlacer');
      await fs.copyFile(sourcePath, destPath);
    } else {
      throw e;
    }
  }
}

export async function removeTemp(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (e) {
    logger.debug(`Failed to remove temp file: ${filePath}`, 'FilePlacer');
  }
}
