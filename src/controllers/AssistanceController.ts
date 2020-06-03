import { Request, Response } from 'express';

import * as assistanceModel from '../models/AssistanceModel';
import * as addressModel from '../models/addressModel';
import * as tagModel from '../models/tagModel';
import { HTTPError as Error } from "../helpers/customError";
import { errorResponse } from 'src/helpers/responseHelper';
import { httpCode } from 'src/helpers/statusCode';
import { assistance as Assistance, address as Address } from "../helpers/dbNamespace";

enum QueryOptions {
  all = "all",
  name = "name",
  id = "id",
  tag = "tag"
};

export const getAll = async (req: Request, res: Response) => {

  const { limit, offset, available } = req.query;

  try {
    const allAssistance = await assistanceModel.getAll(limit, offset, available);
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
    const assistance = await assistanceModel.searchByID({ id: Number(id) });

    res.status(200).json(assistance);
  } catch (error) {
    error.statusCode = 400;
    res.json(error);
    throw error;
  }
};

export const searchQuery = async (req: Request, res: Response) => {
  const { q, data, filter, filterData, orderBy, orderByData, limit, offset, available } = req.query;

  // q stands for query option, may be better to change its name to queryOption and data to queryData

  const response = (assistance: any) => {
    res.status(200).json(assistance);
  };

  try {
    switch (q) {
      case QueryOptions.all: {
        const assistance = await assistanceModel.searchByNameTagDescription(data, {
          filter,
          filterData,
          limit,
          offset,
          orderBy,
          orderByData,
          available
        });
        response(assistance);
        break;
      }
      case QueryOptions.id: {
        const assistance = await assistanceModel.searchByID({ id: Number(data) });
        response(assistance);
        break;
      }

      case QueryOptions.name: {
        const assistance = await assistanceModel.searchByName(data, {
          filter,
          filterData,
          limit,
          offset,
          orderBy,
          orderByData,
          available
        });
        response(assistance);
        break;
      }

      case QueryOptions.tag: {
        const assistance = await assistanceModel.searchByTag(data, {
          filter,
          filterData,
          limit,
          offset,
          orderBy,
          orderByData,
          available
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

export const create = async (req: Request, res: Response) => {
  const userId = (req as any).user;

  const {
    assistance_available_vacancies,
    assistance_course_id,
    assistance_date,
    assistance_description,
    assistance_subject_id,
    assistance_title,
    assistance_total_vacancies,
    tags,
    address_cep,
    address_complement,
    address_latitude,
    address_longitude,
    address_number,
    address_reference,
    address_street,
    address_nickname,
  } = req.body;



  //Try to create the monitoring  

  try {
    const newAssistance = await assistanceModel.create({
      assistance_available_vacancies,
      assistance_course_id,
      assistance_date,
      assistance_description,
      assistance_subject_id,
      assistance_title,
      assistance_total_vacancies,
      assistance_owner_id: userId,
    });

    const newAddress = await (async () => {
      try {
        return await addressModel.create({
          address_cep,
          address_complement,
          address_latitude,
          address_longitude,
          address_number,
          address_reference,
          address_street,
          address_nickname,
          address_assistance_id: newAssistance.insertId
        });
      } catch (error) {
        return new Error(error);
      }
    })();

    if (newAddress instanceof Error || newAddress === undefined || newAddress.affectedRows === undefined) {
      return errorResponse({
        message: "An error occurred while creating the address",
        code: httpCode["Internal Server Error"],
        res
      });
    }

    if (tags.length > 0)
      addTags(tags);

    res.json({ message: "Assistance created", assistanceId: newAssistance.insertId });
  }
  catch (err) {
    return errorResponse({
      message: "An error occurred while creating the the assistance",
      code: httpCode["Internal Server Error"],
      res,
      error: err
    });
  }
}

export const deleteById = async (req: Request, res: Response) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  const assistanceInfo = await getAssistanceOwnerId(assistanceId);

  verifyIfUserHasPermission(userId, assistanceInfo.assistance_owner_id, res);
  verifyIfAssistanceExists(assistanceInfo, res);

  try {
    const response = await assistanceModel.deleteById(Number(assistanceId));
    res.json("Success");
  }
  catch (err) {
    return errorResponse({
      message: "An unknown error ocurred, try again",
      code: httpCode["Internal Server Error"],
      error: err,
      res
    });
  }


}

export const disableById = async (req: Request, res: Response) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  const assistanceInfo = await getAssistanceOwnerId(assistanceId);

  verifyIfUserHasPermission(userId, assistanceInfo.assistance_owner_id, res);
  verifyIfAssistanceExists(assistanceInfo, res);

  try {
    const response = await assistanceModel.update(Number(assistanceId), {
      assistance_suspended: 1,
      assistance_suspended_date: currentDate()
    });

    // console.log(response);
    res.json("Success");
  }
  catch (err) {
    console.log(err);
    return errorResponse({
      message: "An unknown error ocurred, try again",
      code: httpCode["Internal Server Error"],
      error: err,
      res
    });
  }


}

export const update = async (req: Request, res: Response) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  const assistance = req.body as Assistance & Address;

  const assistanceInfo = await getAssistanceOwnerId(assistanceId);

  verifyIfUserHasPermission(userId, assistanceInfo.assistance_owner_id, res)
  verifyIfAssistanceExists(assistanceInfo, res);

  try {
    const response = await assistanceModel.update(Number(assistanceId), {
      ...assistance, assistance_id: undefined
    });

    // console.log(response);
    res.json("Success");
  }
  catch (err) {
    return errorResponse({
      message: "An unknown error ocurred, try again",
      code: httpCode["Internal Server Error"],
      error: err,
      res
    });
  }


}

export const subscribeUser = async (req: Request, res: Response) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  try {
    const assistanceInfo = await assistanceModel.searchByID({
      id: Number(assistanceId),
      select: "assistance_owner_id,	assistance_available_vacancies, assistance_suspended, assistance_available"

    }) as Assistance;

    if (assistanceInfo === undefined || assistanceInfo.assistance_suspended === 1)
      return errorResponse({
        message: "This assistance no longer exists",
        code: httpCode["Bad Request"],
        res
      });

    if (assistanceInfo.assistance_owner_id === Number(userId))
      return errorResponse({
        message: "This user can not subscribe onto his own assistance",
        code: httpCode["Bad Request"],
        res
      });

    if (assistanceInfo.assistance_available_vacancies === 0)
      return errorResponse({
        message: "This assistance has no empty vacancies",
        code: httpCode["Bad Request"],
        res
      });


    // Criar a tabela 
    //TODO: verificar se o usuário ja esta inscrito


    const isSubscribed = await assistanceModel.findSubscribedUsersByID({
      userId: userId,
      assistanceId: Number(assistanceId)
    });

    if (isSubscribed !== undefined)
      return errorResponse({
        message: "This user already is subscribed in this assistance",
        code: httpCode["Not Acceptable"],
        res
      });

    const subscribe = await assistanceModel.subscribeUser({
      assistance_id: assistanceId,
      student_id: userId,
    });

    res.json("User subscribed successfully");

  } catch (error) {
    return errorResponse({
      message: "An error occurred while creating the the assistance",
      code: httpCode["Internal Server Error"],
      res,
      error
    });
  }

}

export const unsubscribeUser = async (req: Request, res: Response) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;


  try {
    const result = await assistanceModel.unsubscribeUsersByID({
      userId,
      assistanceId: Number(assistanceId)
    });


    if (result === undefined)
      return errorResponse({
        message: "An error occurred while creating the the assistance",
        code: httpCode["Internal Server Error"],
        res,
      });


    if (result.affectedRows === 0)
      return errorResponse({
        message: "User was not subscribed in this assistance",
        code: httpCode["I\"m a teapot"],
        res,
      });

    return res.json("User unsubscribed successfully");

  }
  catch (err) {
    return errorResponse({
      message: "An error occurred while creating the the assistance",
      code: httpCode["Internal Server Error"],
      res,
      error: err
    });
  }
}

export const getSubscribers = async (req: Request, res: Response) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;
  const { fields } = req.query;

  const user = await assistanceModel.findSubscribedUsersByID({ userId, assistanceId: Number(assistanceId) });

  if (user === undefined)
    return errorResponse({
      message: "User was not subscribed in this assistance",
      code: httpCode["I\"m a teapot"],
      res,
    });

  if (fields === undefined) {
    return errorResponse({
      message: "Fields must be filled",
      res,
      code: httpCode["Bad Request"]
    });
  }

  const parsedFields = fields.replace(/[\[\]]/g, "")
    .trim()
    .split(",")
    .map((field: string) => `${field.trim()}`);

  if (notAllowedFieldsSearch(parsedFields))
    return errorResponse({
      message: "You has no authorization to search on of these fields",
      res,
      code: httpCode.Unauthorized
    });

  try {
    const users = await assistanceModel.findAllSubscribedUsers(Number(assistanceId), parsedFields.join(","));
    res.json(users);

  } catch (error) {
    if (error.code === "ER_BAD_FIELD_ERROR")
      return errorResponse({
        message: "One field does not exist",
        res,
        code: httpCode["Bad Request"],
      });

    return errorResponse({
      message: "An internal error has ocurred",
      res,
      code: httpCode["Internal Server Error"],
    });
  }
}



async function addTags(tags: Array<string>) {
  const tagsId = [];

  for (const i in tags) {
    try {
      const tag = await tagModel.create({
        tag_name: tags[i].toLowerCase()
      });

      if (tag !== undefined)
        tagsId.push(tag.insertId);

    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        // Search ids in database.
        const tagIdObject = await tagModel.findByName(tags[i].toLowerCase());

        if (tagIdObject !== undefined)
          tagsId.push(tagIdObject.tag_id);
      }

      else {
        // return errorResponse({
        //     message: "An error occurred while creating the address",
        //     code: httpCode["Internal Server Error"],
        //     res
        //   });
      }
    }
  }

  for (const i in tagsId) {
    try {
      await assistanceModel.createTag({
        assistance_id: 1,
        tag_id: tagsId[i]
      });
    } catch (error) {
      throw error;
      // TODO: Save on database error log
      return;
    }

  }
}


function currentDate() {


  const date = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/[\/]/g, "-").replace(",", "").trim()
    .split("-")

  const time = date[2].split(" ");

  return `${time[0]}-${date[0]}-${date[1]} ${time[1]}`

}

function verifyIfUserHasPermission(userId: number, assistanceOwnerId: number, res: Response) {
  if (assistanceOwnerId !== userId) {
    return errorResponse({
      message: "User has no permission to complete this operation",
      code: httpCode.Unauthorized,
      res
    })
  }
}

async function getAssistanceOwnerId(assistanceId: string) {
  return await assistanceModel.searchByID({
    id: Number(assistanceId),
    select: "assistance_owner_id"
  }) as Assistance;
}

function verifyIfAssistanceExists(assistanceInfo: Object, res: Response) {
  if (assistanceInfo === undefined) {
    return errorResponse({
      message: "Assistance does not found",
      code: httpCode["Bad Request"],
      res
    });
  }
}


function notAllowedFieldsSearch(fields: string[]) {
  const notAllowedFields = [
    "user_id",
    "user_created_at",
    "user_matricula",
    "user_idUFFS",
    "user_email",
    "user_phone_number",
    "user_password",
    "user_cpf"
  ];

  for (const field of fields) {
    for (const notAllowed of notAllowedFields) {
      if (field === notAllowed || `user.${notAllowed}` === notAllowed)
        return true;
    }
  }
}