const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }

  res.status(err.statusCode).json({
    error: {
      statusCode: err.statusCode,
      message: err.message,
    },
  });
};

export default errorMiddleware;
