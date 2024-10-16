export class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = false;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
