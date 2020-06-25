import { Request, Response, NextFunction } from "express";

import * as assistanceModel from "src/models/assistanceModel";
import * as addressModel from "src/models/addressModel";
import { assistance as Assistance, address as Address } from "src/helpers/dbNamespaceHelper";
import { CustomError, ErrorCode } from "src/helpers/customErrorHelper";
import { QueryOptions, addTags } from "src/helpers/assistanceHelper";
import { parseQueryField, currentDate, notAllowedFieldsSearch } from "src/helpers/utilHelper";
import { toBoolean } from "src/helpers/conversionHelper";
import { multiValidate } from "src/helpers/validationHelper";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {

  const { limit, offset, available, order, filter, orderBy } = req.query;

  const fields = (req as any).fields;

  try {
    const allAssistance = await assistanceModel.getAll({
      order: order as string,
      fields,
      args: {
        available: available as string,
        limit: Number(limit),
        offset: Number(offset),
        orderBy: orderBy ? JSON.parse(orderBy as string) : undefined,
        filter: filter ? JSON.parse(filter as string) : undefined
      }
    });

    return res.json(allAssistance);

  } catch (error) {
    return next(new CustomError({ code: ErrorCode.INTERNAL_ERROR }));
  }
};

export const getByID = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const assistance = await assistanceModel.searchByID({ id: Number(id) });

    res.json(assistance);

  } catch (error) {
    return next(new CustomError({ error }));
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
    filter
  } = req.query;

  const fields = (req as any).fields;

  const searchParsed = parseQueryField(search as string);

  if (q !== QueryOptions.id)
    return next(new CustomError({ code: ErrorCode.BAD_Q_QUERY }));

  try {
    switch (q as string) {
      case QueryOptions.all: {
        const assistance = await assistanceModel.searchByNameTagDescription({
          search: searchParsed,
          fields,
          args: {
            available: available as string,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: orderBy ? JSON.parse(orderBy as string) : undefined,
            filter: filter ? JSON.parse(filter as string) : undefined
          }
        });

        return res.json(assistance);
      }
      case QueryOptions.id: {
        const assistance = await assistanceModel.searchByID({
          id: searchParsed[0],
          fields
        });

        return res.json(assistance);
      }
      case QueryOptions.name: {
        if (searchParsed) {
          const assistance = await assistanceModel.searchByName({
            name: searchParsed[0],
            fields,
            args: {
              available: available as string,
              limit: Number(limit),
              offset: Number(offset),
              orderBy: orderBy ? JSON.parse(orderBy as string) : undefined,
              filter: filter ? JSON.parse(filter as string) : undefined
            }
          });

          return res.json(assistance);
        }
      }
      case QueryOptions.tag: {
        const tagsParsed = parseQueryField(search as string);

        const assistance = await assistanceModel.searchByTag({
          tags: tagsParsed,
          fields,
          args: {
            available: available as string,
            limit: Number(limit),
            offset: Number(offset),
            orderBy: orderBy ? JSON.parse(orderBy as string) : undefined,
            filter: filter ? JSON.parse(filter as string) : undefined
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
    available_vacancies,
    course_id,
    date,
    description,
    title,
    total_vacancies,
    tags,
    cep,
    complement,
    latitude,
    longitude,
    number: addressNumber,
    reference,
    street,
    nickname,
  } = req.body;

  const validationResult = multiValidate([
    { data: course_id, message: "Course id is not valid.", type: "len=8" },
    { data: date, message: "Date is not valid. Valid format should be yyyy-mm-dd hh:mm:ss or yyyy-mm-dd", type: "len=10" },
    { data: description, message: "Description is not valid. It need to has at least 15 letters", type: "len=15" },
    { data: title, message: "Title is not valid. It need to has at least 5 letters", type: "len=5" },
    { data: total_vacancies, message: "Total vacancies is not valid. It should be a number", type: "number" },
    { data: cep, message: "Cep is not valid. Format 00000000", type: "len=8" },
    { data: addressNumber, message: "Address number is not valid", type: "number" },
    { data: street, message: "Address street name is not valid. It need to has at least 10 letters", type: "len=10" },
    { data: nickname, message: "Address nickname id not valid. it should has at least 3 letter and can not have numbers", type: "len=3" }
  ]);

  if (validationResult.length)
    return next(new CustomError({
      json: validationResult,
      message: "Validation failed",
      code: ErrorCode.VALIDATION_ERR
    }));

  const availableVacanciesLimit = available_vacancies > total_vacancies ? total_vacancies : available_vacancies;

  try {
    const newAssistance = await assistanceModel.create({
      available_vacancies: availableVacanciesLimit ? Number(availableVacanciesLimit) : total_vacancies,
      course_id: course_id ? String(course_id) : undefined,
      date: String(date),
      description: String(description),
      title: String(title),
      total_vacancies: Number(total_vacancies),
      owner_id: String(userId),
    } as any);

    const newAddress = await addressModel.create({
      cep,
      complement,
      latitude,
      longitude,
      number: addressNumber,
      reference,
      street,
      nickname,
      assistance_id: newAssistance.insertId
    });

    if (newAddress instanceof Error || newAddress === undefined || newAddress.affectedRows === undefined) {
      throw next(new CustomError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "An error occurred while creating the address",
      }));
    }

    if (tags && newAssistance.insertId) {
      addTags(newAssistance.insertId, tags);
    }

    return res.json({ message: "Assistance created", assistanceId: newAssistance.insertId });
  }
  catch (error) {
    if (error.code === "ER_BAD_FIELD_ERROR")
      return next(new CustomError({
        error,
        code: ErrorCode.ER_BAD_FIELD_ERROR,
        message: "One or more fields are wrong. It can be the field name or the field data type. Please try consult the documentation"
      }));

    return next(new CustomError({ error }));
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const { assistanceId } = req.params;
  try {
    await assistanceModel.deleteById(assistanceId);
    res.json({ message: "Assistance deleted successfully" });
  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error ocurred while deleting this assistance."
    }));
  }
};

export const disableById = async (req: Request, res: Response, next: NextFunction) => {
  const { assistanceId } = req.params;

  try {
    await assistanceModel.update(assistanceId, {
      available: 0,
      suspended_date: currentDate()
    });

    res.json({ message: "Assistance suspended successfully" });
  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error ocurred while disabling this assistance."
    }));
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { assistanceId } = req.params;

  const assistanceUpdate = req.body as Assistance & Address;

  try {
    const response = await assistanceModel.update(assistanceId, {
      ...assistanceUpdate, id: undefined
    });

    res.json("Success");
  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error occurred while updating this assistance."
    }));
  }
};

export const subscribeUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  try {
    const assistanceInfo = await assistanceModel.searchByID({
      id: assistanceId,
      fields: ["owner_id", "available_vacancies", "available"]
    });

    if (assistanceInfo === undefined || toBoolean(assistanceInfo.assistance.available) === false)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This assistance no longer exists",
      }));

    if (assistanceInfo.assistance.owner_id === userId)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This user can not subscribe onto his own assistance",
      }));

    if (assistanceInfo.assistance.available_vacancies === 0)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This assistance has no empty vacancies",
      }));

    const isSubscribed = await assistanceModel.findSubscribedAssistanceUserByID({
      userId,
      assistanceId,
      select: ["assistance_presence_list.id"]
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

    const updateAssistance = assistanceModel.update(assistanceId, {
      available_vacancies: assistanceInfo.assistance.available_vacancies - 1
    });

    res.json("User subscribed successfully");

  } catch (error) {
    return next(new CustomError({
      error,
      message: "An error occurred while subscribing this user."
    }));
  }

};

export const unsubscribeUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;


  try {

    const assistanceInfo = await assistanceModel.searchByID({
      id: assistanceId,
      fields: ["owner_id", "available_vacancies", "available"]
    });

    if (assistanceInfo === undefined || toBoolean(assistanceInfo.assistance.available) === false)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This assistance no longer exists",
      }));

    if (assistanceInfo.assistance.owner_id === userId)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This user can not unsubscribe in his own assistance",
      }));


    const result = await assistanceModel.unsubscribeUsersByID({
      userId,
      assistanceId
    });

    if (result === undefined)
      return next(new CustomError({
        code: ErrorCode.INTERNAL_ERROR,
        message: "An error occurred while unsubscribing on assistance",
      }));

    if (result.affectedRows === 0)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "User was not subscribed in this assistance",
      }));

    const updateAssistance = await assistanceModel.update(assistanceId, {
      available_vacancies: assistanceInfo.assistance.available_vacancies + 1
    });

    return res.json({ message: "User unsubscribed successfully" });

  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error occurred while creating the the assistance",
    }));
  }
};

export const getSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user;
  const { assistanceId } = req.params;

  const fields = (req as any).fields;

  try {
    const assistance = (await assistanceModel.searchByID({
      id: assistanceId,
      fields: ["owner_id"]
    }))?.assistance;

    const user = await assistanceModel.findSubscribedAssistanceUserByID({ userId, assistanceId, select: ["assistance_presence_list.id"] });

    if (user === undefined && userId !== assistance?.owner_id)
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

    if (notAllowedFieldsSearch(fields))
      return next(new CustomError({
        code: ErrorCode.UNAUTHORIZED
      }));

    const users = await assistanceModel
      .findAllSubscribedUsers(
        assistanceId,
        fields
      );
    res.json(users);

  } catch (error) {
    return next(new CustomError({
      error,
      message: "An error occurred while getting user in this assistance."
    }));
  }
};

export const assistanceGivePresence = async (req: Request, res: Response, next: NextFunction) => {
  const { userCode } = req.body;
  const { assistanceId } = req.params;

  if (userCode === undefined)
    return next(new CustomError({
      code: ErrorCode.BAD_REQUEST,
      message: "User code is invalid. Send a valid user code."
    }));

  try {
    const response = await assistanceModel.givePresenceToUser(assistanceId, userCode);

    if (response.affectedRows === 0)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "User not subscribed on this assistance."
      }));

    res.json({ message: "Presence confirmed successfully" });
  } catch (error) {
    return next(new CustomError({
      code: ErrorCode.INTERNAL_ERROR,
      message: "User not subscribed on this assistance."
    }));
  }
};