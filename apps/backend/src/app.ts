import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { corsOrigins } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { apiRouter } from './routes';

export const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
        return;
      }
      // Expo Go / native clients may send localhost Metro origins in dev.
      if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[api] ${req.method} ${req.originalUrl}`);
    next();
  });
}
app.use('/api/v1', apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
