import { Response, Request, NextFunction } from "express";
import { CustomError, ErrorCode } from 'src/helpers/customErrorHelper';
import { searchByID } from "src/models/assistanceModel";
import { allowedFields, parseQueryField } from 'src/helpers/utilHelper';
import { decryptText, BaseEnumEncryptOptions } from 'src/helpers/utilHelper';

export const verifyIfUserHasPermission = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  try {
    const assistance = (await searchByID({
      id: Number(assistanceId),
      fields: ["owner_id"]
    }))?.assistance;


    if (assistance?.owner_id === undefined || assistance.owner_id != userId) {
      return next(new CustomError({
        message: "User has no permission to complete this operation",
        code: ErrorCode.UNAUTHORIZED,
      }));
    }

    if (assistance === undefined) {
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "The assistance does not exist"
      }));
    }

    (req as any).assistance = assistance;

    next();
  } catch (error) {
    return next(new CustomError({ error }));
  }
};


export const allowedSearchField = (req: Request, res: Response, next: NextFunction) => {
  const { fields } = req.query;
  const parsedFields = parseQueryField(fields);

  if (parsedFields !== undefined)
    if (!allowedFields(parsedFields))
      return next(new CustomError({
        code: ErrorCode.UNAUTHORIZED
      }));


  (req as any).fields = parsedFields;



  next();
};

export const decriptAssistanceId = (req: Request, res: Response, next: NextFunction) => {
  const { assistanceId } = req.params;
  const assistanceIdQuery = req.query.assistanceId;
  const { id, q, search } = req.query;

  try {
    if(assistanceId ){
      const decryptedId = decryptText(assistanceId, BaseEnumEncryptOptions.hex);
  
      req.params.assistanceId = decryptedId ? decryptedId : req.params.assistanceId;
    }
  
    if(assistanceIdQuery ){
      const decryptedId = decryptText(assistanceIdQuery, BaseEnumEncryptOptions.hex);
  
      req.query.assistanceId = decryptedId ? decryptedId : req.query.assistanceId;
    }
  
    if(q === "id") {
      if(id){
        const decryptedId = decryptText(id, BaseEnumEncryptOptions.hex);
        req.query.id = decryptedId ? decryptedId : req.query.id;
      }
  
      if(search){
        const decryptedId = decryptText(search, BaseEnumEncryptOptions.hex);
        req.query.search = decryptedId ? decryptedId : req.query.search;
      }
    }
    next();
  } catch (error) {
    return next(new CustomError({ 
      code: ErrorCode.BAD_REQUEST,
      message: "Assistance id invalid"
     }));
    
  }
};