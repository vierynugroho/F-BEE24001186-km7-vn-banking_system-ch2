import express from 'express';
import logger_format from './config/logger.js';
import logger from 'morgan';
import cors from 'cors';
import {} from 'dotenv/config';
import router from './routes/index.js';
import { errorMiddleware } from './middlewares/error.js';

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

app.use(logger(logger_format.MORGAN_FORMAT));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

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
