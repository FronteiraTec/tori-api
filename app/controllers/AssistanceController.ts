import {Request, Response} from 'express';

import model from '../models/AssistanceModel';

export const getAll = async (req: Request, res: Response) => {

  const {limit, offset, avaliable} = req.query;

  try {
    const allAssistance = await model.getAll(limit, offset, avaliable);
    return res.status(200).json(allAssistance);
  } catch (error) {
    error.statusCode = 400;
    res.json(error);
    throw error;
  }
};

export const getByID = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const assistance = await model.getByID(Number(id));

    res.status(200).json(assistance);
  } catch (error) {
    error.statusCode = 400;
    res.json(error);
    throw error;
  }
};