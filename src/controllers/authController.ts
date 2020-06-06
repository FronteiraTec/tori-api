import { Request, Response, NextFunction } from 'express';

import * as model from 'src/models/authModel';
import { multiValidate } from 'src/helpers/validationHelper';
import { generateJWT } from 'src/helpers/jwtHelper';
import { updateOnlyNullFields } from 'src/models/userModel';
import { CustomError, ErrorCode } from 'src/helpers/customErrorHelper';


export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  const { authenticator, password } = req.body;

  const validateResult = multiValidate([
    { data: authenticator, type: "email", message: "authenticator not valid" },
    { data: password, type: "not-empty", message: "password not valid" },
  ]);

  if (validateResult.length > 0) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: validateResult
    }));
  }

  try {
    const possibleUser = await model.signIn({
      authenticator,
      password: password.toString()
    });


    if (possibleUser === undefined) {
      return next(new CustomError({
        code: ErrorCode.UNAUTHORIZED, message: "User or password incorrect"
      }));
    }

    const responseData = await defaultLoginResponse(possibleUser as { name: string, id: number });
    res.json(responseData);
  } catch (error) {
    return next(new CustomError({ error }))
  }
};

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { name, cpf, email: authenticator, password }:
    { name: string, cpf: string, email: string, password: string } = req.body;

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
    const newUser = await model.signUp({ cpf, authenticator, name, password });
    const responseData = await defaultLoginResponse(newUser);
    return res.json(responseData);
  } catch (error) {
    return next(new CustomError({ error }));
  }
};

export const signInUFFS = async (req: Request, res: Response, next: NextFunction) => {
  const { authenticator, password } = req.body;

  const validateResult = multiValidate([
    { data: password, type: "password", message: "Password invalid" },
    { data: authenticator, type: "email", message: "authenticator invalid" }
  ]);

  if (validateResult.length > 0) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: validateResult
    }));
  }

  // Verificar se o usuário ja esta cadastrado no sistema, se sim realizar o login
  const userAlreadySigned = await model.signIn({ authenticator, password });

  if (userAlreadySigned !== null) {
    // Cadastrado, proceder o login
    const responseData = await defaultLoginResponse(userAlreadySigned);
    return res.json(responseData);
  }

  // Se não, tentar realizar o login com as credenciais uffs
  const tokenAPiUffs = await model.tryUffsLogin({ authenticator, password })

  if (tokenAPiUffs === null) {
    return next(new CustomError({ code: ErrorCode.UNAUTHORIZED }));
  }

  // Usuário autenticado pela uffs, tentar conseguir dados

  let userData = null;
  let userProfilePhoto = null;

  try {
    userData = await model.getDataFromStudentPortal({ authenticator, token: tokenAPiUffs });
  }
  catch (err) {
    return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }));
  }

  try {
    userProfilePhoto = await model.getProfilePhotoFromMoodle(authenticator, password);
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

    const createdUser = await model.signUp(user);

    const responseData = await ({
      id: createdUser.id,
      name: user.name,
      profilePhoto: userProfilePhoto,
      idUffs: user.idUffs,
    });

    return res.json(responseData);
  }
  catch (error) {
    if (error.code !== "ER_DUP_ENTRY") {
      return next(new CustomError({ error }));
    }

    // Usuário ja possui uma conta cadastrado, "sincronizar com a conta da uffs"

    const user = await model.signIn({ authenticator: userData.cpf });

    if (user === null) {
      return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }));
    }

    user.idUFFS = userData.idUffs;

    try {
      // atualizar os dados do usuário no banco!;
      updateOnlyNullFields(user.id, {
        user_cpf: userData.cpf,
        user_full_name: userData.name,
        user_email: userData.email,
        user_password: password,
        user_idUFFS: userData.idUffs,
        user_profile_photo: userProfilePhoto
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


async function defaultLoginResponse(user: { id: number; name: string; profilePhoto?: string; idUffs?: string }) {
  const { token, expiresIn } = await generateJWT({
    id: String(user.id),
  });

  return {
    ...user,
    token,
    expiresIn
  };
}