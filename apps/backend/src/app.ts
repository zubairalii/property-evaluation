import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOrigins } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { apiRouter } from './routes';

export const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
