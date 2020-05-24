import { Response } from 'express';
import { httpCode } from './statusCode';
export function errorResponse({ message, res, code, error }: {
  error?: Error;
  code?: httpCode;
  message: string;
  res: Response;
}) {
  if (code === undefined)
    code = httpCode["Bad Request"];
  return res.status(code)
    .json({
      error: { message, error }
    });
}
