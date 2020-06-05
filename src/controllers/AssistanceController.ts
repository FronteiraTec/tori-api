import { Request, Response, NextFunction } from 'express';

import * as assistanceModel from '../models/AssistanceModel';
import * as addressModel from '../models/addressModel';
import * as tagModel from '../models/tagModel';
import { errorResponse } from 'src/helpers/responseHelper';
import { httpCode } from 'src/helpers/statusCode';
import { assistance as Assistance, address as Address } from "../helpers/dbNamespace";
import { CustomError, ErrorCode } from 'src/helpers/customError';

enum QueryOptions {
  all = "all",
  name = "name",
  id = "id",
  tag = "tag"
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {

  const { limit, offset, available, order, fields } = req.query;

  const parsedFields = parseQueryField(fields);

  if (parsedFields !== undefined)
    if (!allowedFields(parsedFields))
      return next(new CustomError({
        code: ErrorCode.UNAUTHORIZED
      }));


  try {
    const allAssistance = await assistanceModel.getAll({
      limit,
      offset,
      available,
      order,
      fields: parsedFields
    });

    return res.json(allAssistance);

  } catch (error) {
    return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }))
  }
};

export const getByID = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const assistance = await assistanceModel.searchByID({ id: Number(id) });

    res.json(assistance);

  } catch (error) {
    return next(new CustomError({ error }))
  }
};

export const searchQuery = async (req: Request, res: Response, next: NextFunction) => {
  const {
    q,
    available,
    limit,
    offset,
    orderBy,
    search,
    fields,
    filter
  } = req.query;

  const parsedFields = parseQueryField(fields);
  const searchParsed = parseQueryField(search);

  if (searchParsed === undefined)
    return next(new CustomError({ code: ErrorCode.BAD_Q_QUERY }));


  try {
    switch (q) {
      case QueryOptions.all: {
        const assistance = await assistanceModel.searchByNameTagDescription({
          search: searchParsed,
          fields: parsedFields,
          args: {
            available,
            limit,
            offset,
            orderBy: orderBy ? JSON.parse(orderBy) : undefined,
            filter: filter ? JSON.parse(filter) : undefined
          }
        });

        return res.json(assistance);
      }
      case QueryOptions.id: {
        const assistance = await assistanceModel.searchByID({
          id: searchParsed ? Number(searchParsed[0]) : undefined,
          fields: parsedFields
        });

        return res.json(assistance);
      }
      case QueryOptions.name: {
        if (searchParsed) {
          const assistance = await assistanceModel.searchByName({
            name: searchParsed[0],
            fields: parsedFields,
            args: {
              available,
              limit,
              offset,
              orderBy: orderBy ? JSON.parse(orderBy) : undefined,
              filter: filter ? JSON.parse(filter) : undefined
            }
          });

          return res.json(assistance);
        }
      }
      case QueryOptions.tag: {
        const searchParsed = parseQueryField(search);


        const assistance = await assistanceModel.searchByTag({
          tags: searchParsed,
          fields: parsedFields,
          args: {
            available,
            limit,
            offset,
            orderBy: orderBy ? JSON.parse(orderBy) : undefined,
            filter: filter ? JSON.parse(filter) : undefined
          }
        });
        return res.json(assistance);
      }
      default: {
        return next(new CustomError({
          message: "Query option does not exist.",
          code: ErrorCode.BAD_REQUEST
        }));
      }
    }
  }
  catch (error) {
    return next(new CustomError({ error }));
  }

};

export const create = async (req: Request, res: Response, next: NextFunction) => {
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
        return next(new CustomError({ error }));
      }
    })();

    if (newAddress instanceof Error || newAddress === undefined || newAddress.affectedRows === undefined) {
      return next(new CustomError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "An error occurred while creating the address",
      }));
    }

    if (tags.length > 0)
      addTags(tags);

    res.json({ message: "Assistance created", assistanceId: newAssistance.insertId });
  }
  catch (error) {
    return next(new CustomError({ error }));;
  }
}

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  const assistance = (await getAssistanceOwnerId(assistanceId))?.assistance;

  verifyIfUserHasPermission({
    userId,
    assistanceOwnerId: assistance ? assistance.assistance_owner_id : assistance,
    res
  });

  verifyIfAssistanceExists(assistance ? assistance : undefined, res);

  try {
    const response = await assistanceModel.deleteById(Number(assistanceId));
    res.json("Success");
  }
  catch (error) {
    return next(new CustomError({ error }));
  }


}

export const disableById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  const assistance = (await getAssistanceOwnerId(assistanceId))?.assistance;


  verifyIfUserHasPermission({
    userId,
    assistanceOwnerId: assistance ? assistance.assistance_owner_id : undefined,
    res
  });

  verifyIfAssistanceExists(assistance, res);

  try {
    const response = await assistanceModel.update(Number(assistanceId), {
      assistance_suspended: 1,
      assistance_suspended_date: currentDate()
    });

    res.json("Success");
  }
  catch (error) {
    return next(new CustomError({ error }));;
  }


}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  const assistanceUpdate = req.body as Assistance & Address;

  const assistance = (await getAssistanceOwnerId(assistanceId))?.assistance;



  verifyIfUserHasPermission({
    userId,
    assistanceOwnerId: assistance ? assistance.assistance_owner_id : undefined,
    res
  })

  verifyIfAssistanceExists(assistance, res);

  try {
    const response = await assistanceModel.update(Number(assistanceId), {
      ...assistanceUpdate, assistance_id: undefined
    });

    res.json("Success");
  }
  catch (error) {
    return next(new CustomError({ error }));;
  }


}

export const subscribeUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  try {
    const assistanceInfo = await assistanceModel.searchByID({
      id: Number(assistanceId),
      fields: ["assistance_owner_id", "assistance_available_vacancies", "assistance_suspended", "assistance_available"]

    });

    if (assistanceInfo === undefined || assistanceInfo.assistance.assistance_suspended === 1)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This assistance no longer exists",
      }));;

    if (assistanceInfo.assistance.assistance_owner_id === Number(userId))
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This user can not subscribe onto his own assistance",
      }));

    if (assistanceInfo.assistance.assistance_available_vacancies === 0)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This assistance has no empty vacancies",
      }));

    const isSubscribed = await assistanceModel.findSubscribedUsersByID({
      userId: userId,
      assistanceId: Number(assistanceId)
    });

    if (isSubscribed !== undefined)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This user already is subscribed in this assistance",
      }));

    const subscribe = await assistanceModel.subscribeUser({
      assistance_id: assistanceId,
      student_id: userId,
    });

    res.json("User subscribed successfully");

  } catch (error) {
    return next(new CustomError({ error }));;
  }

}

export const unsubscribeUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  try {
    const result = await assistanceModel.unsubscribeUsersByID({
      userId,
      assistanceId: Number(assistanceId)
    });

    if (result === undefined)
      return next(new CustomError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "An error occurred while creating the the assistance",
      }));

    if (result.affectedRows === 0)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "User was not subscribed in this assistance",
      }));

    return res.json("User unsubscribed successfully");

  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error occurred while creating the the assistance",
    }));
  }
}

export const getSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;
  const { fields } = req.query;

  const user = await assistanceModel.findSubscribedUsersByID({ userId, assistanceId: Number(assistanceId) });

  if (user === undefined)
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: "User was not subscribed in this assistance",
    }));

  if (fields === undefined) {
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: "Fields must be filled",
    }));
  }

  const parsedFields = fields.replace(/[\[\]]/g, "")
    .trim()
    .split(",")
    .map((field: string) => `${field.trim()}`);

  if (notAllowedFieldsSearch(parsedFields))
    return next(new CustomError({
      code: ErrorCode.UNAUTHORIZED
    }));

  try {
    const users = await assistanceModel.findAllSubscribedUsers(Number(assistanceId), parsedFields.join(","));
    res.json(users);

  } catch (error) {
    return next(new CustomError({error}));
  }
}



function parseQueryField(fields: string) {
  if (fields === undefined || fields === "") return undefined

  return fields.replace(/[\[\]]/g, "")
    .trim()
    .split(",")
    .map((field: string) => `${field.trim()}`);
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

  /* cspell: disable-next-line */
  const date = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/[\/]/g, "-").replace(",", "").trim()
    .split("-")

  const time = date[2].split(" ");

  return `${time[0]}-${date[0]}-${date[1]} ${time[1]}`

}

function verifyIfUserHasPermission({ userId, assistanceOwnerId, res }: { userId: number; assistanceOwnerId?: number; res: Response; }) {

  if (assistanceOwnerId === undefined || assistanceOwnerId !== userId) {
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
    fields: ["assistance_owner_id"]
  });
}

function verifyIfAssistanceExists(assistanceInfo: Object | undefined, res: Response) {
  if (assistanceInfo === undefined) {
    return errorResponse({
      message: "Assistance does not found",
      code: httpCode["Bad Request"],
      res
    });
  }
}

function allowedFields(fields: string[]) {
  const availableSearchFields = [
    "assistance.assistance_id",
    "assistance.assistance_title",
    "assistance.assistance_description",
    "assistance.assistance_available",
    "assistance.assistance_total_vacancies",
    "assistance.assistance_available_vacancies",
    "assistance.assistance_date",
    "assistanceCourse.course_name",
    "assistanceCourse.course_description",
    "assistanceCourse.course_id",
    "subject.subject_id",
    "subject.subject_name",
    "subject.subject_description",
    "assistant.user_id",
    "assistant.user_full_name",
    "assistant.user_created_at",
    "assistant.user_assistant_stars",
    "assistant.user_email",
    "assistant.user_course_id",
    "assistantCourse.course_id",
    "assistantCourse.course_name",
    "assistantCourse.course_description",
    "address.address_cep",
    "address.address_street",
    "address.address_number",
    "address.address_complement",
    "address.address_reference",
    "address.address_nickname",
    "address.address_latitude",
    "address.address_longitude",
    "address.address_assistance_id",
  ];



  for (const field of fields) {
    let verifier = false;

    for (const allowed of availableSearchFields)
      verifier = verifier || (allowed === field)

    if (verifier === false) return false;
  }

  return true;
}

function notAllowedFieldsSearch(fields: string[]) {
  const notAllowedFields = [
    "user_id",
    "user_created_at",
    /* cspell: disable-next-line */
    "user_matricula",
    /* cspell: disable-next-line */
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

  return false;
}