import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '5056', 10),
  masterKey: process.env.API_KEY ?? '',
  incompletePath: process.env.INCOMPLETE_PATH ?? '/downloads/incomplete',
  completedPath: process.env.COMPLETED_PATH ?? '/downloads/complete',
  maxConcurrentDownloads: parseInt(
    process.env.MAX_CONCURRENT_DOWNLOADS ?? '2',
    10
  ),
  debug: process.env.DEBUG === 'true',
  logBufferSize: parseInt(process.env.LOG_BUFFER_SIZE ?? '500', 10),
  dataDir: process.env.DATA_DIR ?? path.join(process.cwd(), 'config'),
  moviePath: process.env.MOVIE_PATH ?? '',
  tvPath: process.env.TV_PATH ?? '',
};
