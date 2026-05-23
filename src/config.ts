import dotenv from 'dotenv';

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
};
