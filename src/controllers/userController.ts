import { Request, Response } from 'express';

import * as model from '../models/userModel';
import { httpCode } from 'src/helpers/statusCode';


export const getUser = async (req: Request, res: Response) => {
  const { limit, offset, assistant, fields } = req.query;

  let parsedFields = undefined;

  if (fields !== undefined) {
    parsedFields = fields.replace(/[\[\]]/g, "")
      .trim()
      .split(",")
      .map((field: string) => `\`${field.trim()}\``)
      .join(",");
  }

  try {
    const result = await model.getAll({
      offset,
      limit,
      assistant,
      fields: parsedFields
    })
  
    res.json(result);
  } catch (err) {
    res.status(httpCode["Internal Server Error"])
    .json(err);
  }

};

export const updateUser = async (req: Request, res: Response) => {
  //   const { limit, offset, avaliable } = req.query;
};

export const deleteUser = async (req: Request, res: Response) => {
  //   const { limit, offset, avaliable } = req.query;
};