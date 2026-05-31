import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import router from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use('/api/v1', router);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
