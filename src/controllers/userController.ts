import { Request, Response } from 'express';
import crypto from "crypto";
import { writeFileSync, fstat } from 'fs';
import path from 'path';

import * as userModel from '../models/userModel';
import * as addressModel from '../models/addressModel';

import { httpCode } from '../helpers/statusCode';
import { errorResponse } from '../helpers/responseHelper';


export const getUser = async (req: Request, res: Response) => {
  const { limit, offset, assistant, fields } = req.query;

  let parsedFields = undefined;

  if (fields !== undefined) {
    parsedFields = fields.replace(/[\[\]]/g, "")
      .trim()
      .split(",")
      .map((field: string) => `\`${field.trim()}\``)
  }

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
  } catch (err) {
    console.log(err)
    res.status(httpCode["Internal Server Error"])
      .json(err);
  }

};

export const searchUser = async (req: Request, res: Response) => {
  const { q, email, id, name, assistant, fields } = req.query;

  const userId = (req as any).user;

  let parsedFields = undefined;

  if (fields !== undefined) {
    parsedFields = fields.replace(/[\[\]]/g, "")
      .trim()
      .split(",")
      .map((field: string) => `\`${field.trim()}\``)
  }

  try {
    let result = undefined;

    if (q === "own") {
      result = await userModel.getById({ userId, fields: parsedFields.join(",") });
      return res.json(result);
    }

    if (userId !== id) {
      if (!verifyUserPermission(parsedFields)) {
        return errorResponse({
          message: "Not allowed",
          res,
          code: httpCode.Unauthorized
        });
      }
    }

    if (q === "email" && email)
      result = await userModel.getByEmail({
        email: email,
        fields: parsedFields ? parsedFields.join(",") : undefined
      });

    else if (q === "id" && id)
      result = await userModel.getById({
        userId: id,
        fields: parsedFields ? parsedFields.join(",") : undefined
      });

    else if (q === "name")
      result = await userModel.getByName({
        name,
        fields: parsedFields ? parsedFields.join(",") : undefined
      });
    else {
      return res
        .status(httpCode["Internal Server Error"])
        .json({
          error: {
            message: "No option selected. Please inform a q param and try again"
          }
        });
    }

    res.json(result);

  } catch (err) {
    res.status(httpCode["Internal Server Error"])
      .json(err);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { userFields, addressId, addressFields } = req.body;

  const userId = (req as any).user;


  function verifyContentISCorrect(content: any) {
    if (content === undefined || content === "" || !(content instanceof Object) || Object.keys(content).length === 0) {
      return errorResponse({ res, message: "field \"userFields\" is malformed" });
    }
  }

  function verifyObjectHasEmptyValues(object: object) {
    for (let i in userFields) {
      const field = userFields[i];

      if (field === "")
        return errorResponse({ res, message: "One field is blank" });
    };

  }

  if (!userId) return errorResponse({ res, message: "UserId is missing" });

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
  } catch (err) {
    console.log(err);
    return errorResponse({
      res,
      code: httpCode["Internal Server Error"],
      message: "Internal error"
    });
  }

};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = (req as any).user;

  try {
    const result = await userModel.deleteById(userId);
    console.log(result);

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return errorResponse({
        message: "User has an assistance. Delete the assistance before deleting the account",
        code: httpCode["Not Acceptable"],
        // error: err,
        res
      });
    }

    return errorResponse({
      message: "An error ocurred while deleting this user",
      code: httpCode["Internal Server Error"],
      error: err,
      res
    })
  }
};


export const uploadImage = async (req: Request, res: Response) => {
  const { extension, image: base64Image } = req.body;

  const userId = (req as any).user;

  try {
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
  } catch (err) {
    return errorResponse({
      message: "An error ocurred while updating the image",
      code: httpCode["Internal Server Error"],
      error: err,
      res
    })
  }
};

function createImageName({ userId, extension, imagePath }: { userId: number; extension: any; imagePath: string; }) {
  const imageName = crypto.createHash('md5')
    .update(userId.toString()).
    digest("hex") + `.${extension}`;

  return path.join(imagePath, imageName);
}

function saveImageFromBase64({ path, base64String }: { path: string; base64String: string; }) {
  try {
    writeFileSync(path, decodeBase64Image(base64String), { encoding: 'base64' });
  } catch (err) {
    throw err;
  }
}

function decodeBase64Image(base64String: string) {
  if (base64String.startsWith("data:image")) {
    return base64String.split(';base64,').pop();
  }
  else {
    return base64String
  }
}

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
