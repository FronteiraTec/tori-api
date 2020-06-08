export class CustomError extends Error {
  public code: string = "";

  constructor(message: string, code?: string) {
    super(message);

    if(code !== undefined)
      this.code = code;
    
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}