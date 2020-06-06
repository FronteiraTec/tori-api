import { Request, Response, NextFunction } from 'express';

import * as userModel from '../models/userModel';
import * as addressModel from '../models/addressModel';

import { httpCode } from '../helpers/statusCodeHelper';
import { errorResponse } from '../helpers/responseHelper';
import { parseQueryField } from 'src/helpers/utilHelper';
import { CustomError, ErrorCode } from 'src/helpers/customErrorHelper';
import { createImageName, saveImageFromBase64 } from 'src/helpers/outputHelper';


enum UserQueryOption {
  own = "own",
  email = "email",
  id = "id",
  name = "name"
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset, assistant, fields } = req.query;

  const parsedFields = parseQueryField(fields);

  if (!verifyUserPermission(parsedFields)) {
    return errorResponse({
      message: "Not allowed",
      res,
      code: httpCode.Unauthorized
    });
  }

  try {
    const result = await userModel.getAll({
      offset,
      limit,
      assistant,
      fields: parsedFields ? parsedFields.join(",") : undefined
    })

    res.json(result);
  } catch (error) {

    return next(new CustomError({ error }));
  }

};

export const searchUser = async (req: Request, res: Response, next: NextFunction) => {
  const { q, email, id, name, fields } = req.query;

  const userId = (req as any).user;

  const parsedFields = parseQueryField(fields);

  if (userId !== id) {
    if (!verifyUserPermission(parsedFields)) {
      return errorResponse({
        message: "Not allowed",
        res,
        code: httpCode.Unauthorized
      });
    }
  }

  try {
    switch (q) {
      case UserQueryOption.own: {
        const result = await userModel.getById({
          userId,
          fields: parsedFields ? parsedFields.join(",") : undefined
        });
        return res.json(result);
      }

      case UserQueryOption.email: {
        const result = await userModel.getByEmail({
          email: email,
          fields: parsedFields ? parsedFields.join(",") : undefined
        });
        return res.json(result);
      }

      case UserQueryOption.id: {
        const result = await userModel.getById({
          userId: id,
          fields: parsedFields ? parsedFields.join(",") : undefined
        });
        return res.json(result);
      }

      case UserQueryOption.name: {
        const result = await userModel.getByName({
          name,
          fields: parsedFields ? parsedFields.join(",") : undefined
        });

        return res.json(result);
      }

      default: {
        const result = await userModel.getById({
          userId,
          fields: parsedFields ? parsedFields.join(",") : undefined
        });
        return res.json(result);
      }
    }
  }
  catch (error) {
    return next(new CustomError({ error }));
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { userFields, addressId, addressFields } = req.body;

  const userId = (req as any).user;

  verifyContentISCorrect(userFields);
  verifyObjectHasEmptyValues(userFields);

  if (addressId) {
    verifyContentISCorrect(addressFields);
    verifyObjectHasEmptyValues(addressFields);
  }

  try {
    await userModel.update(userId, userFields);

    if (addressId)
      await addressModel.update(addressId, addressFields);

    res.json("Fields updated successfully");
  }
  catch (error) {
    return next(new CustomError({ error }));
  }

  function verifyContentISCorrect(content: any) {
    if (content === undefined || content === "" || !(content instanceof Object) || content.length === 0) {
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "field \"userFields\" is malformed"
      }));
    }
  }

  function verifyObjectHasEmptyValues(object: object) {
    for (let i in userFields) {
      const field = userFields[i];

      if (field === "")
        return next(new CustomError({ code: ErrorCode.BAD_REQUEST, message: "One field is empty" }));
    };

  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user;

  try {
    const result = await userModel.deleteById(userId);

    return res.json({ message: "User deleted successfully" });
  }
  catch (error) {
    return next(new CustomError({ error }));
  }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  const { extension, image: base64Image } = req.body;

  const userId = (req as any).user;

  try {
    //TODO: Move this to .env 
    const imagePath = "src/public/images/profile-picture/";
    const imageName = createImageName({ userId, extension, imagePath });

    saveImageFromBase64({
      path: imageName,
      base64String: base64Image
    });

    const result = await userModel.updateProfilePicture({
      userId,
      imagePath: imageName.split("src/")[1]
    });

    return res.json({ message: "Image uploaded successfully" });
  }
  catch (error) {
    return next(new CustomError({ error }));
  }
};

function verifyUserPermission(parsedFields: any) {
  const notAllowedSearchFields = [
    "user_id",
    "user_created_at",
    "user_matricula",
    "user_idUFFS",
    "user_email",
    "user_phone_number",
    "user_password",
    "user_cpf",
  ];

  let has = false;

  if (parsedFields) {
    parsedFields.forEach((field: string) => {
      notAllowedSearchFields.forEach((notAllowed: string) => {
        if (field === `\`${notAllowed}\``) {
          has = true;
          return;
        }
      });
    });
  }

  return !has;
}