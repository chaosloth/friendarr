import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '5056', 10),
  masterKey: process.env.API_KEY ?? '',
  libraryBasePath: process.env.LIBRARY_BASE_PATH ?? '/media',
  tempDir: process.env.TEMP_DIR ?? '/tmp/friendarr',
  maxConcurrentDownloads: parseInt(
    process.env.MAX_CONCURRENT_DOWNLOADS ?? '2',
    10
  ),
};
