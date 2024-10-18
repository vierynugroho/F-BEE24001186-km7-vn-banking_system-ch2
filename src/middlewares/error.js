import { Prisma } from '@prisma/client';

export class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line no-unused-vars
export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: {
          statusCode: 409,
          message: 'Duplicate field, constraint violation',
        },
      });
    } else if (err.code === 'P2003') {
      res.status(409).json({
        error: {
          statusCode: 409,
          message: 'Key Constraint',
          details: err.message,
        },
      });
    } else if (err.code === 'P2005') {
      res.status(409).json({
        error: {
          statusCode: 409,
          message: 'Resource not found',
          details: err.message,
        },
      });
    } else {
      res.status(500).json({
        error: {
          statusCode: 500,
          message: 'something went wrong',
          details: err.message,
        },
      });
    }
  } else if (err instanceof ErrorHandler) {
    res.status(err.statusCode).json({
      error: {
        statusCode: err.statusCode,
        message: err.message,
      },
    });
  } else {
    res.status(500).json({
      error: {
        statusCode: 500,
        message: 'something went wrong',
        details: err.message,
      },
    });
  }
};
