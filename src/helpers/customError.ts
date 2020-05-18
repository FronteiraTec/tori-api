export class HTTPError extends Error {
  public statusCode: number = -1;

  constructor(message: string, statusCode?: number) {
    super(message);

    if(statusCode !== undefined)
      this.statusCode = statusCode;
    
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}