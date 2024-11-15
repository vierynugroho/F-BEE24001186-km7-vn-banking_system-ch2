import {} from 'dotenv/config';
import './libs/sentry.js';
import express from 'express';
import logger_format from './config/logger.js';
import logger from 'morgan';
import cors from 'cors';
import router from './routes/index.js';
import { errorMiddleware } from './middlewares/error.js';
import session from 'express-session';
import * as Sentry from '@sentry/node';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  cors({
    origin: '*',
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders:
      'Content-Type, Authorization, Accept, Accept-Language, Accept-Encoding',
    exposedHeaders:
      'Content-Type, Authorization, Accept, Accept-Language, Accept-Encoding',
    maxAge: 3600,
  }),
);

app.set('view engine', 'ejs');
app.set('views', __dirname + 'src/views');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(logger(logger_format.MORGAN_FORMAT));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.get('/debug-sentry', function mainHandler() {
  throw new Error(500, 'My Awesome Sentry error!');
});

// sentry
Sentry.setupExpressErrorHandler(app);

// ErrorHandler -> custom error handler -> ga masuk sentry
// Error -> bawaan JS -> masuk sentry

// error response handler
app.use(errorMiddleware);

// 404 Response Handler
app.use((req, res) => {
  const url = req.url;
  const method = req.method;
  res.status(404).json({
    error: {
      statusCode: 404,
      message: `${method} - ${url} is not found!`,
    },
  });
});

export default app;
