import { Request, Response } from 'express';

import * as assistanceModel from '../models/AssistanceModel';
import * as addressModel from '../models/addressModel';
import * as tagModel from '../models/tagModel';
import { HTTPError as Error } from "../helpers/customError";
import { errorResponse } from 'src/helpers/responseHelper';
import { httpCode } from 'src/helpers/statusCode';
import { assistance as Assistance } from "../helpers/dbNamespace";

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

enum QueryOptions {
  all = "all",
  name = "name",
  id = "id",
  tag = "tag"
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

    if (newAddress instanceof Error || newAddress.affectedRows === undefined) {
      return errorResponse({
        message: "An error occurred while creating the address",
        code: httpCode["Internal Server Error"],
        res
      });
    }

    // const addressId = newAddress.insertId;

    if (tags.length > 0)
      addTags(tags);

    res.json({ message: "Assistance created", assistanceId: newAssistance.insertId });
  }
  catch (err) {
    // if (addressId)
    //   addressModel.deleteById(addressId);

    return errorResponse({
      message: "An error occurred while creating the the assistance",
      code: httpCode["Internal Server Error"],
      res,
      error: err
    });
  }
}

export const deleteById = async (req: Request, res: Response) => {
  // const userId = (req as any).user;
  const userId = 20;
  const { assistanceId } = req.params;

  const assistanceInfo = await assistanceModel.searchByID({
    id: Number(assistanceId),
    select: "assistance_owner_id"
  }) as Assistance;

  if (assistanceInfo === undefined) {
    return errorResponse({
      message: "Assistance does not found",
      code: httpCode["Bad Request"],
      res
    });
  }

  if (assistanceInfo.assistance_owner_id !== userId) {
    return errorResponse({
      message: "User has no permission to complete this operation",
      code: httpCode.Unauthorized,
      res
    })
  }

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
  // const userId = (req as any).user;
  const userId = 20;
  const { assistanceId } = req.params;

  const assistanceInfo = await assistanceModel.searchByID({
    id: Number(assistanceId),
    select: "assistance_owner_id"
  }) as Assistance;

  if (assistanceInfo === undefined) {
    return errorResponse({
      message: "Assistance does not found",
      code: httpCode["Bad Request"],
      res
    });
  }

  if (assistanceInfo.assistance_owner_id !== userId) {
    return errorResponse({
      message: "User has no permission to complete this operation",
      code: httpCode.Unauthorized,
      res
    })
  }

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
// export const create = async (req: Request, res: Response) => {
// }
// export const create = async (req: Request, res: Response) => {
// }
// export const create = async (req: Request, res: Response) => {
// }


async function addTags(tags: Array<string>) {
  const tagsId = [];

  for (const i in tags) {
    try {
      const tag = await tagModel.create({
        tag_name: tags[i].toLowerCase()
      });

      tagsId.push(tag.insertId);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        // Search ids in database.
        const tagIdObject = await tagModel.findByName(tags[i].toLowerCase());
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