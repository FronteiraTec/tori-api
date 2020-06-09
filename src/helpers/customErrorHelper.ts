import { json } from 'body-parser';

export class CustomError extends Error {
  public code: ErrorCode;
  public status: number;

  constructor({ message, code, status, error }: { message?: string | Object[] | Object; code?: ErrorCode; status?: number; error?: any }) {
    if (typeof message === 'string')
      super(message);
    else
      super(JSON.stringify(message))

    this.code = ErrorCode.INTERNAL_ERROR;
    this.status = 500;

    if (code || status || message) {
      if (code)
        this.code = code;
      if (status)
        this.status = status;
      if (typeof message === 'string')
        this.message = message;
      else
        this.message = JSON.stringify(message);
    }
    if (error) {
      if (error.code) {
        if (error.code === "ER_BAD_FIELD_ERROR")
          this.code = ErrorCode.ER_BAD_FIELD_ERROR
        if (error.code === "ER_NON_UNIQ_ERROR")
          this.code = ErrorCode.ER_NON_UNIQ_ERROR
        if (error.code === "ER_NONUNIQ_TABLE")
          this.code = ErrorCode.ER_NONUNIQ_TABLE
        if (error.code === "ER_DUP_ENTRY")
          this.code = ErrorCode.ER_DUP_ENTRY
        if (error.code = "ER_ROW_IS_REFERENCED_2") {
          this.code = ErrorCode.ER_ROW_IS_REFERENCED_2;
        }
      }
      if (error.name === "SyntaxError")
        this.code = ErrorCode.ER_JSON_CON;
    }

    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(this.code.toString())).stack;
    }
  }
}

export enum ErrorCode {
  LIM_OFF_NOT_NUM,
  UNAUTHORIZED,
  BAD_REQUEST,
  INTERNAL_ERROR,
  ER_BAD_FIELD_ERROR,
  ER_NON_UNIQ_ERROR,
  ER_JSON_CON,
  BAD_Q_QUERY,
  ER_NONUNIQ_TABLE,
  ER_DUP_ENTRY,
  ER_ROW_IS_REFERENCED_2
}

export const DefaultErrorMessage = {
  [ErrorCode.LIM_OFF_NOT_NUM]: "Limit or offset are not numbers.",
  [ErrorCode.UNAUTHORIZED]: "You has no authorization to access this content",
  [ErrorCode.BAD_REQUEST]: "One of fields are either malformed or missing.",
  [ErrorCode.INTERNAL_ERROR]: "One of fields are either malformed or missing.",
  [ErrorCode.ER_BAD_FIELD_ERROR]: "One of fields does not exist on database. Please consult the documentation.",
  [ErrorCode.ER_NON_UNIQ_ERROR]: "Not unique key, please verify your fields and search for duplicates.",
  [ErrorCode.ER_JSON_CON]: "Error while parsing json fields, please send valid encoded json.",
  [ErrorCode.BAD_Q_QUERY]: "q param is missing. Please define a q.",
  [ErrorCode.ER_NONUNIQ_TABLE]: "Not unique key or alias, please type tableName.tableField and not only tableField.",
  [ErrorCode.ER_DUP_ENTRY]: "Duple entry in one of fields.",
  [ErrorCode.ER_ROW_IS_REFERENCED_2]: "Can not delete it. You should delete its references before"
}