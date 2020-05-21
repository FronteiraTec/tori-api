import { Request, Response } from 'express';

import * as model from '../models/authModel';
import { httpCode } from '../helpers/statusCode';
import { multiValidate, validate } from '../helpers/validation';
import { generateJWT } from '../helpers/jwtHelper';

// // import { HTTPError as Error } from "../helpers/customError";

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const validateResult = validate({ data: email, type: "email", message: "Email not valid"});

  if (validateResult !== true) {
    res.status(httpCode["Not Acceptable"]).json(validateResult.message);
    return;
  }

  try {
    const possibleUser = await model.signIn({ email, password });

    if(possibleUser === null){
      res.status(httpCode.Unauthorized).json("email or password invalid");
      return;
    }
    
    return defaultLoginResponse(possibleUser as {name: string, id: number}, res);

  } catch (err) {
    res.status(httpCode["Internal Server Error"]).json(err);
  }
};

export const signUp = async (req: Request, res: Response) => {
  const { name, cpf, email, password } = req.body;

  // TODO: Alterar algoritmo de validador de CPf, falha para alguns
  const allValidations = [
    { data: cpf, type: "cpf", message: "CPF invalid" },
    { data: name, type: "name", mustHas: " ", len: 6, message: "Name invalid" },
    { data: password, type: "password", message: "Password invalid" },
    { data: email, type: "email", message: "Email invalid" },
  ];

  const validationResult = multiValidate(allValidations);


  if (validationResult.length !== 0) {
    res.status(httpCode["Not Acceptable"]).json(validationResult);
    return;
  }

  try {
    const newUser = await model.signUp({ cpf, email, name, password });


    return defaultLoginResponse(newUser, res);
  } catch (err) {
    // Caso cpf ja cadastrado retornar erro
    res.status(httpCode.Conflict).json(err);
  }
};

export const loginIdUFFS = async (req: Request, res: Response) => {

};

async function defaultLoginResponse(user: { id: number; name: string; }, res: Response<any>) {
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
