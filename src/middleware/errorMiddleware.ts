import { NextFunction, Request, Response } from 'express';
import { CustomError, ErrorCode, DefaultErrorMessage } from 'src/helpers/customErrorHelper';
import { httpCode } from 'src/helpers/statusCodeHelper';

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  let status = 500;


  if (error.code === ErrorCode.LIM_OFF_NOT_NUM)
    status = httpCode["Bad Request"];
  if (error.code === ErrorCode.BAD_REQUEST)
    status = httpCode["Bad Request"];
  if (error.code === ErrorCode.UNAUTHORIZED)
    status = httpCode.Unauthorized;
  if (error.code === ErrorCode.INTERNAL_ERROR)
    status = httpCode["Internal Server Error"];
  if (error.code === ErrorCode.ER_BAD_FIELD_ERROR)
    status = httpCode["Bad Request"];
  
  return res
    .status(status)
    .json({
      message: error.message ? error.message : DefaultErrorMessage[error.code],
      code: error.code
    });
}