export class HTTPError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number= null) {
      super(message);
      this.name = this.constructor.name;
      if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = (new Error(message)).stack;
      }
    }
  }

  // now I can extend

//   export class HTTPError extends ExtendableError {};

//   let myerror = new HTTPError("ll");
//   console.log(myerror.message);
//   console.log(myerror instanceof Error);
//   console.log(myerror.name);
//   console.log(myerror.stack);