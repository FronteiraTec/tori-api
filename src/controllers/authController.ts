import { Request, Response, NextFunction } from 'express';

import * as authModel from 'src/models/authModel';
import * as userModel from 'src/models/userModel';
import { user as User } from 'src/helpers/dbNamespaceHelper';
import { multiValidate, validate } from 'src/helpers/validationHelper';
import { generateJWT } from 'src/helpers/jwtHelper';
import { updateOnlyNullFields } from 'src/models/userModel';
import { CustomError, ErrorCode } from 'src/helpers/customErrorHelper';
import {
  saveUserUniqueQrCodeFromRawId,
  getQrCodePath
} from 'src/helpers/outputHelper';
import { join } from 'path';
import { encryptText, BaseEnumEncryptOptions } from 'src/helpers/utilHelper';


export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  const { authenticator, password } = req.body;

  const validateResult = multiValidate([
    { data: authenticator, type: "len=3", message: "authenticator not valid" },
    { data: password, type: "len=3", message: "password not valid" },
  ]);

  if (validateResult.length > 0) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: validateResult
    }));
  }

  try {
    const possibleUser = await authModel.signIn({
      authenticator,
      password: password.toString()
    });

    if (possibleUser === undefined || possibleUser === null) {
      return next(new CustomError({
        code: ErrorCode.UNAUTHORIZED,
        message: "User or password incorrect"
      }));
    }


    const responseData = await defaultLoginResponse(possibleUser);
    res.json(responseData);
  } catch (error) {
    return next(new CustomError({
      error,
      message: "An error occuried while signing in."
    }))
  }
};

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { full_name: name, cpf, email: authenticator, password }:
    { full_name: string, cpf: string, email: string, password: string } = req.body;

  const allValidations = [
    { data: cpf, type: "cpf", message: "CPF invalid" },
    { data: name, type: "name", mustHas: " ", len: 6, message: "Name invalid" },
    { data: password, type: "password", message: "Password invalid" },
    { data: authenticator, type: "email", message: "authenticator invalid" }
  ];

  const validateResult = multiValidate(allValidations);



  if (validateResult.length > 0) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: validateResult
    }));
  }

  try {
    const newUser = await authModel.signUp({ cpf, authenticator, name, password });
    const responseData = await defaultLoginResponse(newUser);

    await saveUserUniqueQrCodeFromRawId(newUser.id);

    return res.json(responseData);
  } catch (error) {
    return next(new CustomError({
      error,
      message: "An error occuried while creating this user."
    }));
  }
};

export const signInUFFS = async (req: Request, res: Response, next: NextFunction) => {
  const { authenticator, password } = req.body;

  const validateResult = multiValidate([
    { data: password, type: "len=3", message: "Password invalid" },
    { data: authenticator, type: "len=4", message: "authenticator invalid" }
  ]);

  if (validateResult.length > 0) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: validateResult
    }));
  }

  // Verificar se o usuário ja esta cadastrado no sistema, se sim realizar o login
  const userAlreadySigned = await authModel.signIn({ authenticator, password });

  if (userAlreadySigned !== null) {
    // Cadastrado, proceder o login
    const responseData = await defaultLoginResponse(userAlreadySigned);

    return res.json(responseData);
  }

  // Se não, tentar realizar o login com as credenciais uffs
  const tokenAPiUffs = await authModel.tryUffsLogin({ authenticator, password })

  if (tokenAPiUffs === null) {
    return next(new CustomError({
      code: ErrorCode.UNAUTHORIZED
    }));
  }

  // Usuário autenticado pela uffs, tentar conseguir dados

  let userData = null;
  let userProfilePhoto = null;

  try {
    userData = await authModel.getDataFromStudentPortal({ authenticator, token: tokenAPiUffs });
  }
  catch (err) {
    return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }));
  }

  try {
    userProfilePhoto = await authModel.getProfilePictureFromMoodle(authenticator, password);
  }
  catch (error) {
    return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }));
  }

  // Salvar o usuário no banco de dados local

  try {

    const user = {
      cpf: userData.cpf,
      name: userData.name,
      authenticator: userData.email,
      password: password,
      id: -1,
      idUffs: userData.idUffs,
      profilePhoto: userProfilePhoto
    };

    const createdUser = await authModel.signUp(user);

    const responseData = ({
      id: createdUser.id,
      full_name: user.name,
      profile_photo: userProfilePhoto,
      idUffs: user.idUffs,
    });

    //criar um qrcode para o usuário;
    await saveUserUniqueQrCodeFromRawId(createdUser.id);

    return res.json(responseData);
  }
  catch (error) {
    if (error.code !== "ER_DUP_ENTRY") {
      return next(new CustomError({
        error,
        message: "User already signed up."
      }));
    }

    // Usuário ja possui uma conta cadastrado, "sincronizar com a conta da uffs"

    const user = await authModel.signIn({ authenticator: userData.cpf });

    if (user === null) {
      return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }));
    }

    user.idUFFS = userData.idUffs;

    try {
      // atualizar os dados do usuário no banco!;
      updateOnlyNullFields(user.id, {
        cpf: userData.cpf,
        full_name: userData.name,
        email: userData.email,
        password: password,
        idUFFS: userData.idUffs,
        profile_picture: userProfilePhoto
      });
    } catch (error) {
      return next(new CustomError({
        message: "Error updating database.",
        error
      }));
    }

    const responseData = await defaultLoginResponse(user);
    res.json(responseData);
  }
};

export const verifyAvailability = async (req: Request, res: Response, next: NextFunction) => {
  const { q, search } = req.query;

  enum QueryOptions {
    cpf = "cpf",
    email = "email",
    username = "username"
  }

  if (!search) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST
    }));
  }

  try {
    switch (q) {
      case QueryOptions.cpf: {
        if (validate({ data: search, type: "cpf" }) !== true)
          return next(new CustomError({ code: ErrorCode.BAD_REQUEST, message: "CPF invalid" }));

        const user = await userModel.getWhere({ key: "cpf", value: search, fields: "id" });

        if (user.length === 0)
          return res.json({ available: true });

        return res.json({ available: false });
      }
      case QueryOptions.email: {
        if (validate({ data: search, type: "email" }) !== true)
          return next(new CustomError({ code: ErrorCode.BAD_REQUEST, message: "Email invalid" }));

        const user = await userModel.getByEmail({ email: search, fields: ["id"] });

        if (user.length === 0)
          return res.json({ available: true });

        return res.json({ available: false });
      }
      case QueryOptions.username: {
        if (validate({ data: search, type: "len=3" }) !== true)
          return next(new CustomError({ code: ErrorCode.BAD_REQUEST, message: "Username invalid" }));

        const user = await userModel.getWhere({ key: "idUFFS", value: search, fields: "id" });

        if (user.length === 0)
          return res.json({ available: true });

        return res.json({ available: false });
      }

      default:
        return next(new CustomError({ code: ErrorCode.BAD_REQUEST, message: "q option missing." }));
    }
  } catch (error) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST
    }));
  }
}

async function defaultLoginResponse(user: User) {
  const { token, expiresIn } = await generateJWT({
    id: String(user.id),
  });

  const qrCode = encryptText(user.id, BaseEnumEncryptOptions.hex);
  const qrCodePath = getQrCodePath();

  if (qrCodePath === undefined)
    throw new Error("No qrCode path found");

  return {
    full_name: user.full_name,
    token,
    expiresIn,
    qrCode: join(qrCodePath, qrCode + ".png")
  };
}