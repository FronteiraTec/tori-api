import { Request, Response, NextFunction } from 'express';

import * as userModel from '../models/userModel';
import * as addressModel from '../models/addressModel';

import { httpCode } from '../helpers/statusCodeHelper';
import { errorResponse } from '../helpers/responseHelper';
import { parseQueryField, hashPassword, decryptTextHex, capitalizeFirstLetter, allowedFields } from 'src/helpers/utilHelper';
import { CustomError, ErrorCode } from 'src/helpers/customErrorHelper';
import { createImageName, saveImageFromBase64, saveUserUniqueQrCodeFromRawId } from 'src/helpers/outputHelper';
import { findAllSubscribedAssistanceByUser, findAllCreatedAssistanceByUser, searchByID, findSubscribedUsersByID, update } from 'src/models/assistanceModel';
import { user as User } from 'src/helpers/dbNamespaceHelper'
import { multiValidate, ValidationFields } from 'src/helpers/validationHelper';


enum UserQueryOption {
  own = "own",
  email = "email",
  id = "id",
  name = "name"
}

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const { limit, offset, assistant } = req.query;

  const fields = (req as any).fields;

  try {
    const result = await userModel.getAll({
      offset,
      limit,
      assistant,
      fields
    })

    res.json(result);
  } catch (error) {
    return next(new CustomError({
      error,
      message: "An error has occurred while retrieving user list"
    }));
  }

};

export const searchUser = async (req: Request, res: Response, next: NextFunction) => {
  const { q, search, fields } = req.query;

  const userId = (req as any).user;

  const parsedFields = parseQueryField(fields);

  // console.log(verifyUserPermission(parsedFields));

  if (q !== undefined && q !== UserQueryOption.own && userId !== search) {
    if (!allowedFields(parsedFields)) {
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
          fields: parsedFields
        });
        return res.json(result);
      }

      case UserQueryOption.email: {
        const result = await userModel.getByEmail({
          email: search,
          fields: parsedFields
        });
        return res.json(result);
      }

      case UserQueryOption.id: {
        const result = await userModel.getById({
          userId: search,
          fields: parsedFields
        });
        return res.json(result);
      }

      case UserQueryOption.name: {
        const result = await userModel.getByName({
          name: search,
          fields: parsedFields
        });

        return res.json(result);
      }

      default: {
        const result = await userModel.getById({
          userId,
          fields: parsedFields
        });
        return res.json(result);
      }
    }
  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error has occurred while searching user"
    }));
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const updateUser = removeUneditableFields(req.body);

    validateFields(updateUser);

    const userId = (req as any).user;

    await userModel.update(userId, updateUser);

    res.json({ message: "Fields updated successfully" });

  }
  catch (error) {
    if (error.code === "ER_BAD_FIELD_ERROR")
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "Some of fields are not valid. Please fill the userFields with valid fields."
      }));

    if (error.code === "ERR_INVALID_ARG_VALUE")
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "Course id is not valid."
      }));

    if (error.code === ErrorCode.VALIDATION_ERR)
      return next(error)

    return next(new CustomError({
      error,
      message: "An error has occurred while updating this user."
    }));
  }

  function removeUneditableFields(user: User | any) {
    try {
      return {
        ...user,
        id: undefined,
        cpf: undefined,
        created_at: undefined,
        matricula: undefined,
        student_stars: undefined,
        verified_assistant: undefined,
        assistant_stars: undefined,
        idUFFS: undefined,
        password: user.password ? hashPassword(user.password) : undefined,
        course_id: user.course_id ? decryptTextHex(user.course_id) : undefined
      } as User;
    }
    catch (error) {
      throw error;
    }
  }

  function validateFields(user: User) {
    const validateData = Object.keys(user).map((key) => {
      if (key === "password")
        return {
          data: user[key as keyof typeof user],
          type: "password",
          message: 'Password is not valid.'
        };

      if (key === "course_id")
        return {
          data: user[key as keyof typeof user],
          type: "number",
          message: 'CourseId is not valid.'
        };

      return {
        data: user[key as keyof typeof user],
        type: "len=3",
        message: `${capitalizeFirstLetter(key)} is not valid.`
      };
    });

    const res = multiValidate(validateData as ValidationFields[]);

    if (res.length > 0)
      throw new CustomError({
        code: ErrorCode.VALIDATION_ERR,
        json: res
      });
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user;

  try {
    const result = await userModel.deleteById(userId);

    return res.json({ message: "User deleted successfully" });
  }
  catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return next(new CustomError({
        error,
        message: "This user has an assistance or participated in one. Try disable this account instead of deleting it."
      }));

    return next(new CustomError({
      error,
      message: "An error has occurred while deleting this user."
    }));
  }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  const { extension, image: base64Image } = req.body;

  const userId = (req as any).user;

  try {
    const imagePath = process.env.PROFILE_PIC_PATH;

    if (imagePath === undefined) throw new CustomError({ message: "Image path not found in env file" });

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
    return next(new CustomError({
      error,
      message: "An error has occurred while uploading this image."
    }));
  }
};

export const assistanceCreated = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user;
  const { fields: rawFields, q, search, limit, offset, available, orderBy, filter } = req.query;

  const fields = parseQueryField(rawFields);

  try {
    switch (q) {
      case "id": {

        const userAssistance = await searchByID({
          id: search,
          fields,
          args: {
            available,
            limit,
            offset,
            orderBy: orderBy ? JSON.parse(orderBy) : undefined,
            filter: filter ? JSON.parse(filter) : undefined
          }
        });

        if (userAssistance?.assistance.owner_id != userId)
          return next(new CustomError({ code: ErrorCode.UNAUTHORIZED }));

        return res.json(userAssistance);
      }

      default: {
        const userAssistanceList = await findAllCreatedAssistanceByUser({
          userId,
          select: fields,
          args: {
            available,
            limit,
            offset,
            orderBy: orderBy ? JSON.parse(orderBy) : undefined,
            filter: filter ? JSON.parse(filter) : undefined
          }
        });

        return res.json(userAssistanceList);
      }
    }

  } catch (error) {
    if (error.code === "ERR_INVALID_ARG_VALUE")
      return next(new CustomError({
        code: ErrorCode.INVALID_ID
      }));
    

    return next(new CustomError({
      error,
      message: "An error has occurred retrieving user's assistance list."
    }));
  }

};

export const assistanceSubscribed = async (req: Request, res: Response, next: NextFunction) => {
  const fields = (req as any).fields;
  const userId = (req as any).user;

  const { q, search, limit, offset, active, orderBy, filter } = req.query;

  try {
    if (q === "id") {
      const userAssistance = await findSubscribedUsersByID({
        userId,
        assistanceId: search,
        select: fields,
        args: {
          available: active,
          offset,
          limit,
          orderBy: orderBy ? JSON.parse(orderBy) : undefined,
          filter: filter ? JSON.parse(filter) : undefined
        }
      });

      return res.json(userAssistance);
    }

    const userAssistanceList = await findAllSubscribedAssistanceByUser({
      userId,
      select: fields,
      args: {
        available: active,
        offset,
        limit,
        orderBy: orderBy ? JSON.parse(orderBy) : undefined,
        filter: filter ? JSON.parse(filter) : undefined
      }
    });

    return res.json(userAssistanceList)
  } catch (error) {
    return next(new CustomError({
      error,
      message: "An error has occurred retrieving user's assistance list."
    }));
  }
};

export const generateQrCode = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user;

  try {
    const imageName = await saveUserUniqueQrCodeFromRawId(userId);

    res.json(imageName);
  } catch (error) {
    next(new CustomError({ error }));
  }

}



function verifyUserPermission(parsedFields: any) {
  const notAllowedSearchFields = [
    "user.id",
    "user.created_at",
    "user.matricula",
    "user.idUFFS",
    "user.email",
    "user.phone_number",
    "user.password",
    "user.cpf",
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