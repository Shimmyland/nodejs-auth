import { Request, Response, NextFunction } from "express";
import { ApiError, CustomError, ValidationError } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  switch (true) {
    case err instanceof ValidationError:
      res.status(err.statusCode).json({ messages: err.messages });
      logger.error(`Validation errors: ${err.messages}`);
      break;
    case err instanceof CustomError:
      res.status(err.statusCode).json({ message: err.message });
      logger.error(`${err.message}`);
      break;
    case err instanceof ApiError:
      res.status(err.statusCode).json({ message: err.message });
      logger.error(`${err.originalMessage}`);
      break;
    default:
      res.status(500).json({
        message:
          err.message ||
          "An unexpected error occurred on the server. Please try again later.",
      });
      logger.error(`UNEXPECTED: ${err.message}, ${err.stack}`);
  }
}
