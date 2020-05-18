import { Request, Response } from 'express';

import model from '../models/AssistanceModel';
import { HTTPError as Error } from "../helpers/customError";

export const getAll = async (req: Request, res: Response) => {

  const { limit, offset, avaliable } = req.query;

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
    const assistance = await model.searchByID(Number(id));

    res.status(200).json(assistance);
  } catch (error) {
    error.statusCode = 400;
    res.json(error);
    throw error;
  }
};

enum QueryOptions {
  all = "all",
  name = "name",
  id = "id",
  tag = "tag"
};

export const searchQuery = async (req: Request, res: Response) => {
  const { q, data, filter, filterData, orderBy, orderByData, limit, offset, avaliable } = req.query;

  // q stands for query option, may be better to change its name to queryOption and data to queryData

  const response = (assistance: any) => {
    res.status(200).json(assistance);
  };

  try {
    switch (q) {
      case QueryOptions.all: {
        const assistance = await model.searchByNameTagDescription(data, {
          filter,
          filterData,
          limit,
          offset,
          orderBy,
          orderByData,
          avaliable
        });
        response(assistance);
        break;
      }
      case QueryOptions.id: {
        const assistance = await model.searchByID(Number(data));
        response(assistance);
        break;
      }

      case QueryOptions.name: {
        const assistance = await model.searchByName(data, {
          filter,
          filterData,
          limit,
          offset,
          orderBy,
          orderByData,
          avaliable
        });
        response(assistance);
        break;
      }

      case QueryOptions.tag: {
        const assistance = await model.searchByTag(data, {
          filter,
          filterData,
          limit,
          offset,
          orderBy,
          orderByData,
          avaliable
        });
        response(assistance);
        break;
      }
      default: {
        const error = new Error("Query option does not exist", 400);
        res.json({ "error": error.message });
        // throw error;
        break;
      }
    }
  }
  catch (error) {
    error.statusCode = 400;
    res.json(error);
    throw error;
  }

};