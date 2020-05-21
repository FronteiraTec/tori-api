import { Request, Response } from 'express';

import * as model from '../models/authModel';
import { httpCode } from '../helpers/statusCode';
import { multiValidate } from '../helpers/validation';
import { generateJWT } from '../helpers/jwtHelper';

// // import { HTTPError as Error } from "../helpers/customError";

export const signIn = async (req: Request, res: Response) => {

  // res.send()
};

export const signUp = async (req: Request, res: Response) => {
  const { name, cpf, email, password } = req.body;

  // TODO: validar os campos
  const allValidations = [
    { data: cpf, type: "cpf", message: "CPF invalid" },
    { data: name, type: "name", mustHas: " ", len: 6, message: "Name invalid" },
    { data: password, type: "password", message: "Password invalid"},
    { data: email, type: "email", message: "Email invalid"},
  ];

  const validationResult = multiValidate(allValidations);


  if (validationResult.length !== 0) {
    res.status(httpCode["Not Acceptable"]).json(validationResult);
    return;
  }

  try {
    const newUser = await model.signUp({ cpf, email, name, password });


    const { token, expiresIn } = await generateJWT({
      id: newUser.id,
      expireTime: "1d"
    });

    res.json({
      ...newUser,
      token,
      expiresIn
    });
  } catch (err) {
    // Caso cpf ja cadastrado retornar erro
    res.status(httpCode.Conflict).json(err);
  }
};

export const loginIdUFFS = async (req: Request, res: Response) => {

};