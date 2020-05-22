import { Request, Response } from 'express';

import * as model from '../models/authModel';
import { httpCode } from '../helpers/statusCode';
import { multiValidate, validate } from '../helpers/validation';
import { generateJWT } from '../helpers/jwtHelper';
import { updateOnlyNullFields } from 'src/models/userModel';

// // import { HTTPError as Error } from "../helpers/customError";

export const signIn = async (req: Request, res: Response) => {
  const { authenticator, password } = req.body;

  const validateResult = multiValidate([
    { data: authenticator, type: "email", message: "authenticator not valid" },
    { data: password, type: "not-empty", message: "password not valid" },
  ]);

  if (validateResult.length > 0) {
    return res.status(httpCode["Not Acceptable"]).json({
      error: {
        reason: validateResult
      }
    });
  }

  try {
    const possibleUser = await model.signIn({
      authenticator,
      password: password.toString()
    });

    if (possibleUser === null) {
      res.status(httpCode.Unauthorized).json("authenticator or password invalid");
      return;
    }

    return defaultLoginResponse(possibleUser as { name: string, id: number }, res);

  } catch (err) {
    console.log(err)
    res.status(httpCode["Internal Server Error"]).json(err);
  }
};

export const signUp = async (req: Request, res: Response) => {
  const { name, cpf, authenticator, password }:
    { name: string, cpf: string, authenticator: string, password: string } = req.body;

  const allValidations = [
    { data: cpf, type: "cpf", message: "CPF invalid" },
    { data: name, type: "name", mustHas: " ", len: 6, message: "Name invalid" },
    { data: password, type: "password", message: "Password invalid" },
    { data: authenticator, type: "email", message: "authenticator invalid" }
  ];

  const validationResult = multiValidate(allValidations);


  if (validationResult.length !== 0) {
    res.status(httpCode["Not Acceptable"]).json(validationResult);
    return;
  }

  try {
    const newUser = await model.signUp({ cpf, authenticator, name, password });


    return defaultLoginResponse(newUser, res);
  } catch (err) {

    res.status(httpCode.Conflict).json(err);
  }
};

export const loginIdUFFS = async (req: Request, res: Response) => {
  const { authenticator, password } = req.body;

  // vValida os inputs
  if (authenticator.length < 5 || password.empty) {
    return res.status(httpCode["Not Acceptable"])
      .json({
        error: {
          message: "Password or authenticator not acceptable, less than 5 letters was found"
        }
      });
  }

  // Verificar se o usuário ja esta cadastrado no sistema, se sim realizar o login
  const userAlreadySigned = await model.signIn({ authenticator, password });

  if (userAlreadySigned !== null) {
    // Cadastrado, proceder o login
    defaultLoginResponse(userAlreadySigned, res);
    return;
  }

  // Se não, tentar realizar o login com as credenciais uffs
  const tokenAPiUffs = await model.tryUffsLogin({ authenticator, password })

  if (tokenAPiUffs === null) {
    return res.status(httpCode.Unauthorized).json({
      "error": {
        message: "Usuário ou senha incorretos"
      }
    });
  }

  // Usuário autenticado pela uffs, tentar conseguir dados

  let userData = null;
  let userProfilePhoto = null;

  try {
    userData = await model.getDataFromStudentPortal({ authenticator, token: tokenAPiUffs });
  }
  catch (err) {
    return res.status(httpCode["Internal Server Error"]).json({
      error: {
        message: "Error while getting information on student portal",
        error: err
      }
    });
  }

  try {
    userProfilePhoto = await model.getProfilePhotoFromMoodle(authenticator, password);
  }
  catch (err) {
    throw new Error("Error while getting information on student profile photo on moodle");
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

    return defaultLoginResponse({
      id: createdUser.id,
      name: user.name,
      profilePhoto: userProfilePhoto,
      idUffs: user.idUffs,
    }, res);
  }
  catch (err) {
    if (err.code !== "ER_DUP_ENTRY") {
      // Erro ao criar usuário
      return res.status(httpCode["Internal Server Error"])
        .json(err);
    }

    // Usuário ja possui uma conta cadastrado, "sincronizar com a conta da uffs"

    const user = await model.signIn({ authenticator: userData.cpf });

    if (user === null) {
      return res.status(httpCode["Internal Server Error"])
        .json(err);
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
    } catch (err) {
      console.log({
        error: {
          message: "Erro ao atualizar os dados do usuário no banco de dados"
        }
      });
      throw err;
    }

    return defaultLoginResponse(user, res);
  }
};


async function defaultLoginResponse(user: { id: number; name: string; profilePhoto?: string; idUffs?: string }, res: Response<any>) {
  const { token, expiresIn } = await generateJWT({
    id: String(user.id),
    expireTime: "1d"
  });
  res.json({
    ...user,
    token,
    expiresIn
  });
}