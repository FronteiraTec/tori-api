import { Response, Request, NextFunction } from "express";
import { errorResponse } from '../helpers/responseHelper';
import { httpCode } from '../helpers/statusCode';
import { validateJWT } from '../helpers/jwtHelper';


export const userAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  function getToken(req: Request) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      return authHeader.split(" ")[1];
    }
    else return false;

  }

  const token = getToken(req);

  if (token === false)
    return errorResponse({ message: "Unauthorized", code: httpCode.Unauthorized, res });



  try {
    const tokenDecoded = await validateJWT({ token });
    const userId = Object(tokenDecoded).data.id;
    (req as any).user = userId;
    
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return errorResponse({ message: "Token expired", code: httpCode.Unauthorized, res });

    return errorResponse({ message: "Token malformed", code: httpCode["Bad Request"], res });
  }

}