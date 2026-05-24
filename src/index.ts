import express from 'express';
import fs from 'fs';
import path from 'path';
import { banner, logger } from './logger';
import { config } from './config';
import apiRoutes from './routes/api';

const app: express.Express = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', apiRoutes);

const uiPath = path.join(__dirname, 'ui');
app.get('/', (_req, res) => {
  const filePath = path.join(uiPath, 'index.html');
  let html = fs.readFileSync(filePath, 'utf-8');
  const defaults = JSON.stringify({
    incompletePath: config.incompletePath,
    completedPath: config.completedPath,
    hasMasterKey: !!config.masterKey,
  });
  html = html.replace(
    '<head>',
    `<head><script>window.__FRIENDARR_DEFAULTS__ = ${defaults};</script>`
  );
  res.send(html);
});
app.use(express.static(uiPath));

app.listen(config.port, () => {
  banner();
  logger.info(`Friendarr 0.1.0`, 'Server');

  logger.info(
    `Server ready — API: http://localhost:${config.port}/api/v1  UI: http://localhost:${config.port}`,
    'Server'
  );

  if (config.masterKey) {
    logger.info('Master API key configured', 'Auth');
  } else {
    logger.warn('No API_KEY set — set it to manage API keys', 'Auth');
  }

  logger.info(
    `Max concurrent downloads: ${config.maxConcurrentDownloads}`,
    'Queue'
  );
});

export default app;
