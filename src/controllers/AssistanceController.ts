import { Request, Response, NextFunction } from 'express';

import * as assistanceModel from 'src/models/AssistanceModel';
import * as addressModel from 'src/models/addressModel';
import { assistance as Assistance, address as Address } from 'src/helpers/dbNamespace';
import { CustomError, ErrorCode } from 'src/helpers/customError';
import { QueryOptions, addTags } from 'src/helpers/assistanceHelper';
import { parseQueryField, allowedFields, currentDate, notAllowedFieldsSearch } from 'src/helpers/utilHelper';
import { toBoolean } from 'src/helpers/conversionHelper';

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

  if (searchParsed === undefined && q !== QueryOptions.id)
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

    if (tags)
      addTags(tags);

    res.json({ message: "Assistance created", assistanceId: newAssistance.insertId });
  }
  catch (error) {
    return next(new CustomError({ error }));;
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  const { assistanceId } = req.params;

  try {
    const response = await assistanceModel.deleteById(Number(assistanceId));
    res.json("Success");
  }
  catch (error) {
    return next(new CustomError({ error }));
  }
};

export const disableById = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

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
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const { assistanceId } = req.params;

  const assistanceUpdate = req.body as Assistance & Address;

  try {
    const response = await assistanceModel.update(Number(assistanceId), {
      ...assistanceUpdate, assistance_id: undefined
    });

    res.json("Success");
  }
  catch (error) {
    return next(new CustomError({ error }));;
  }
};

export const subscribeUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;

  try {
    const assistanceInfo = await assistanceModel.searchByID({
      id: Number(assistanceId),
      fields: ["assistance_owner_id", "assistance_available_vacancies", "assistance_suspended", "assistance_available"]
    });

    if (assistanceInfo === undefined || assistanceInfo.assistance.assistance_suspended == 1 || toBoolean(assistanceInfo.assistance.assistance_available) == false)
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

    const updateAssistance = assistanceModel.update(assistanceId, {
      assistance_available_vacancies: assistanceInfo.assistance.assistance_available_vacancies -1
    });

    res.json("User subscribed successfully");

  } catch (error) {
    return next(new CustomError({ error }));;
  }

};

export const unsubscribeUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;


  try {

    const assistanceInfo = await assistanceModel.searchByID({
      id: Number(assistanceId),
      fields: ["assistance_owner_id", "assistance_available_vacancies", "assistance_suspended", "assistance_available"]
    });

    if (assistanceInfo === undefined || assistanceInfo.assistance.assistance_suspended == 1 || toBoolean(assistanceInfo.assistance.assistance_available) == false)
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This assistance no longer exists",
      }));;

    if (assistanceInfo.assistance.assistance_owner_id === Number(userId))
      return next(new CustomError({
        code: ErrorCode.BAD_REQUEST,
        message: "This user can not unsubscribe in his own assistance",
      }));


    const result = await assistanceModel.unsubscribeUsersByID({
      userId,
      assistanceId: Number(assistanceId)
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

    const updateAssistance = assistanceModel.update(assistanceId, {
      assistance_available_vacancies: assistanceInfo.assistance.assistance_available_vacancies + 1
    });

    return res.json("User unsubscribed successfully");

  }
  catch (error) {
    return next(new CustomError({
      error,
      message: "An error occurred while creating the the assistance",
    }));
  }
};

export const getSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user as number;
  const { assistanceId } = req.params;
  const { fields } = req.query;

  const assistance = (await assistanceModel.searchByID({
    id: Number(assistanceId),
    fields: ["assistance_owner_id"]
  }))?.assistance;

  const user = await assistanceModel.findSubscribedUsersByID({ userId, assistanceId: Number(assistanceId) });

  if (user === undefined && userId != assistance?.assistance_owner_id)
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

  const parsedFields = parseQueryField(fields);

  if (notAllowedFieldsSearch(parsedFields))
    return next(new CustomError({
      code: ErrorCode.UNAUTHORIZED
    }));

  try {
    if (parsedFields === undefined)
      throw new CustomError({ code: ErrorCode.BAD_REQUEST });

    const users = await assistanceModel
      .findAllSubscribedUsers(
        Number(assistanceId),
        parsedFields.join(",")
      );
    res.json(users);

  } catch (error) {
    return next(new CustomError({ error }));
  }
};