import DbHelper from "../helpers/dbHelper";
import {
  assistance as Assistance,
  assistance_tag as AssistanceTag,
  assistance_presence_list as AssistancePresenceList,
  user as User,
  address as Address,
  subject as Subject,
  course as Course,
  assistance
} from "../helpers/dbNamespaceHelper";
import { InsertResponse, DeleteResponse } from "src/helpers/dbResponsesHelper";
import { toBoolean } from "src/helpers/conversionHelper";
import { decryptHexId, encryptTextHex, decryptTextHex } from "src/helpers/utilHelper";


interface AssistanceSearch {
  assistance: Assistance;
  address: Address;
  assistant: User;
  assistanceCourse: Course;
  assistantCourse: Course;
  subject: Subject;
}

interface FilterOptions {
  filter?: object;
  limit?: number;
  offset?: number;
  orderBy?: object;
  available?: boolean | string | number;
}

export const getAll = async ({ args, order, fields }: { fields: string[] | undefined, order: string, args?: FilterOptions }) => {
  const db = new DbHelper();

  if (fields?.length)
    fieldSearch({ fields, db });
  else {
    defaultSearch({ db });
  }

  if (order && !args?.orderBy)
    db.orderBy("assistance.date", order);
  else if (!args?.orderBy) {
    db.orderBy("assistance.date", "DESC");
  }

  if (args)
    defaultFilters(args, db);

  const assistanceList = await db.resolve() as AssistanceSearch[];
  return encryptId(assistanceList);
};

export const searchByID = async ({ id, fields, args }:
  { args?: FilterOptions, fields?: string[], id: number | string; }) => {

  const db = new DbHelper();

  if (fields?.length)
    fieldSearch({ fields, db });
  else
    defaultSearch({ db });

  if (args)
    defaultFilters(args, db);

  db.where("assistance.id", decryptHexId(id));

  const assistanceResponse = await db.resolve() as AssistanceSearch[];

  return assistanceResponse.length > 0 ? encryptId(assistanceResponse)[0] : undefined;
};

export const searchByName = async ({ name, fields, args }:
  { fields?: string[], name: string; args?: FilterOptions; }) => {

  const db = new DbHelper();

  if (fields?.length)
    fieldSearch({ fields, db });
  else
    defaultSearch({ db });

  db.where("assistance.title")
    .like(`%${name}%`);


  if (args)
    defaultFilters(args, db);

  const assistanceResponse = await db.resolve() as AssistanceSearch[];

  return encryptId(assistanceResponse);
};

export const searchByTag = async ({ tags, fields, args }:
  { fields?: string[], tags?: string[]; args?: FilterOptions; }) => {

  const db = new DbHelper();

  if (fields?.length)
    fieldSearch({ fields, db });
  else
    defaultSearch({ db });

  db.rightJoin("assistance_tag as at at.assistance_id", "assistance.id")
    .rightJoin("tag.id", "at.id");

  if (tags)
    tags.map((str, i) => {
      if (i === 0)
        db.where("(tag.name");
      else
        db.or("(tag.name");

      db.like(`%${str}%`)
        .or("assistance.title").like(`%${str}%`)
        .or("assistance.description").like(`%${str}%`, ")");
    });


  if (args)
    defaultFilters(args, db);

  const assistanceResponse = await db.resolve() as AssistanceSearch[];

  return encryptId(assistanceResponse);

};

export const searchByNameTagDescription = async ({ search, fields, args }:
  { fields?: string[], search: string[] | undefined; args?: FilterOptions; }) => {

  const db = new DbHelper();

  if (fields?.length)
    fieldSearch({ fields, db });
  else
    defaultSearch({ db });

  db.leftJoin("assistance_tag as at at.assistance_id", "assistance.id")
    .leftJoin("tag.id", "at.id");

  if (search)
    search.map((str, i) => {
      if (i === 0)
        db.where("(tag.name");
      else
        db.or("(tag.name");

      db.like(`%${str}%`)
        .or("assistance.title").like(`%${str}%`)
        .or("assistance.description").like(`%${str}%`, ")");

    });

  if (args)
    defaultFilters(args, db);

  const assistanceResponse = await db.resolve() as AssistanceSearch[];

  return encryptId(assistanceResponse);
};

export const deleteById = async (id: number | string) => {
  const db = new DbHelper();

  db.delete("assistance")
    .where("id", decryptHexId(id));

  return db.resolve();
};

export const create = async (assistanceData: Assistance): Promise<InsertResponse> => {
  const db = new DbHelper();

  const newAssistance = await db.insert("assistance", {
    ...assistanceData,
    course_id: assistanceData?.course_id ? decryptHexId(assistanceData.course_id) : undefined,
    owner_id: decryptHexId(assistanceData.owner_id)
  } as assistance).resolve() as InsertResponse[];

  if (newAssistance[0].affectedRows === 1 && newAssistance[0].insertId)
    newAssistance[0].insertId = encryptTextHex(newAssistance[0].insertId);

  return newAssistance[0];
};

export const update = async (assistanceId: number | string, assistanceFields: Assistance | object) => {
  const db = new DbHelper();

  const result = await
    db.update("assistance", assistanceFields)
      .where("id", decryptHexId(assistanceId))
      .resolve();

  return result;
};

export const createTag = async (assistanceTag: AssistanceTag | object): Promise<InsertResponse> => {
  const db = new DbHelper();

  const newTag = await db.insert("assistance_tag", assistanceTag).resolve() as InsertResponse;
  return newTag;
};

export const subscribeUser = async (presenceList: AssistancePresenceList | any): Promise<InsertResponse> => {
  const db = new DbHelper();

  const newPresenceList = await db
    .insert("assistance_presence_list", {
      assistance_id: decryptHexId(presenceList.assistance_id),
      student_id: decryptHexId(presenceList.student_id)
    } as AssistancePresenceList)
    .resolve() as InsertResponse;
  return newPresenceList;

};

export const findAllSubscribedUsers = async (assistanceId: number | string, select?: string[]) => {
  const db = new DbHelper();

  if (select?.length)
    db.select(select.join(", "));
  else
    db.select("user.id, user.full_name, user.created_at, user.email");


  db.from("assistance_presence_list")
    .join("user.id", "assistance_presence_list.student_id")
    .where("assistance_presence_list.assistance_id", decryptHexId(assistanceId));

  const res = await db.resolve() as { user: User, assistance_presence_list: AssistancePresenceList }[];

  const encryptUserFields = (itemList: { user: User, assistance_presence_list: AssistancePresenceList }[]) => {
    return itemList.map(item => {
      return {
        user: {
          ...item.user,
          id: item.user.id ? encryptTextHex(item.user.id) : undefined,
          course_id: item.user.course_id ? encryptTextHex(item.user.course_id) : undefined
        } as User
      };
    });
  };

  return encryptUserFields(res);

};

export const findSubscribedAssistanceUserByID = async ({ userId, assistanceId, select, args }: { args?: FilterOptions, select?: string[], userId: number | string; assistanceId: number | string; }) => {
  const db = new DbHelper();

  db.join("assistance.id", "assistance_presence_list.assistance_id");

  if (select?.length)
    fieldSearch({ fields: select, db, from: "assistance_presence_list" });
  else
    defaultSearch({ db, from: "assistance_presence_list" });

  if (args)
    defaultFilters(args, db);

  const assistanceInfo = await db
    .where("assistance_presence_list.student_id", decryptHexId(userId))
    .and("assistance_presence_list.assistance_id", decryptHexId(assistanceId))
    .resolve() as AssistanceSearch[];

  return encryptId(assistanceInfo);
};

export const unsubscribeUsersByID = async ({ userId, assistanceId }: { userId: number | string; assistanceId: number | string; }) => {
  const db = new DbHelper();

  const user = await db
    .delete("assistance_presence_list")
    .where("student_id", decryptHexId(userId))
    .and("assistance_id", decryptHexId(assistanceId))
    .resolve() as DeleteResponse[];

  return user.length > 0 ? user[0] : undefined;
};

export const editSubscribedUsersByID = async ({ userId, assistanceId, fields }: { fields: AssistancePresenceList | object, userId: number | string; assistanceId: number | string; }) => {
  const db = new DbHelper();

  const result = await db.update("assistance_presence_list", fields)
    .where("assistance_presence_list.student_id", decryptHexId(userId))
    .and("assistance_presence_list.assistance_id", decryptHexId(assistanceId))
    .resolve();

  return result;
};

export const givePresenceToUser = async (assistanceId: string | number, userId: string | number) => {

  return (await editSubscribedUsersByID({
    assistanceId,
    userId,

    fields: {
      student_presence: true
    }
  }))[0] as InsertResponse;
};

export const findAllSubscribedAssistanceByUser = async ({ args, userId, select }: { args?: FilterOptions, userId: number; select?: string[]; }) => {
  const db = new DbHelper();

  db.join("assistance.id", "assistance_presence_list.assistance_id");

  if (select?.length)
    fieldSearch({ fields: select, db, from: "assistance_presence_list" });
  else
    defaultSearch({ db, from: "assistance_presence_list" });

  if (args)
    defaultFilters(args, db);

  const assistanceInfo = await db
    .where("assistance_presence_list.student_id", decryptHexId(userId))
    .resolve() as AssistanceSearch[];

  return encryptId(assistanceInfo);
};

export const findAllCreatedAssistanceByUser = async ({ userId, select, args }: { args?: FilterOptions, userId: number; select?: string[]; }) => {
  const db = new DbHelper();

  if (select?.length)
    fieldSearch({ fields: select, db });
  else
    defaultSearch({ db });

  if (args)
    defaultFilters(args, db);

  db.where("assistance.owner_id", decryptHexId(userId));

  const res = await db.resolve() as AssistanceSearch[];

  return encryptId(res);
};

export const updateAllByDate = async (date: string, assistanceFields: Assistance | object) => {
  const db = new DbHelper();

  const result = await
    db.update("assistance", assistanceFields)
      .where(`date <= ${date}`)
      .and("available", true)
      .resolve() as InsertResponse[];

  return result;
};

const fieldSearch = ({ fields, db, from }: { from?: string, fields: string[]; db: DbHelper; }) => {
  const fieldsString = fields.join(",");
  db.select(fieldsString);

  if (from)
    db.from(from);
  else
    db.from("assistance");


  const address = fieldsString.search("address.");
  const assistant = fieldsString.search("assistant.");
  const assistanceCourse = fieldsString.search("assistanceCourse.");
  const assistantCourse = fieldsString.search("assistantCourse.");
  const subject = fieldsString.search("subject.");

  if (assistant >= 0)
    db.join("assistance.owner_id", "user as assistant assistant.id");
  if (assistanceCourse >= 0)
    db.leftJoin("assistance.course_id", "course as assistanceCourse assistanceCourse.id");
  if (assistantCourse >= 0)
    db.leftJoin("assistant.course_id", "course as assistantCourse assistantCourse.id");
  if (address >= 0)
    db.leftJoin("address.assistance_id", "assistance.id");
  if (subject >= 0)
    db.leftJoin("subject.course_id", "assistanceCourse.id");

  return db;
};

const defaultSearch = ({ db, from }: { db: DbHelper; from?: string; }) => {
  if (from)
    db.from(from);
  else
    db.from("assistance");

  db.
    select(`
        assistance.*,
        assistant.id,
        assistant.full_name,
        assistant.created_at,
        assistant.assistant_stars,
        assistant.email,
        assistant.verified_assistant,
        assistanceCourse.name,
        assistanceCourse.description,
        assistanceCourse.id,
        assistantCourse.id,
        assistantCourse.name,
        assistantCourse.description,
        subject.id,
        subject.name,
        subject.description,
        address.*
    `)

    .join("assistance.owner_id", "user as assistant assistant.id")
    .leftJoin("assistance.course_id", "course as assistanceCourse assistanceCourse.id")
    .leftJoin("assistant.course_id", "course as assistantCourse assistantCourse.id")
    .leftJoin("address.assistance_id", "assistance.id")
    .leftJoin("subject.course_id", "assistanceCourse.id");

  return db;
};

const defaultFilters = (args: FilterOptions, db: DbHelper) => {
  if (args.limit && args.offset)
    db.pagination(args.limit, args.offset);

  if (args.filter) {
    const filters = args.filter;

    const i = 0;

    for (const key of Object.keys(filters)) {
      const value = filters[key as keyof typeof filters] as string;

      const query = findAndDecryptId(key, value.trim());

      db.where(query);
    }
  }

  if (args.available) {
    if (toBoolean(args.available.toString())) {
      db.where("assistance.available", "1");
      db.and("suspended_date IS NULL");
    }
    else {
      db.where("assistance.available", "0");
      db.or("suspended_date IS NOT NULL");
    }
  }


  if (args.orderBy) {
    for (const key of Object.keys(args.orderBy)) {
      const value = args.orderBy[key as keyof typeof args.orderBy];
      db.orderBy(key, value);
      break;
    }
  }
};


function findAndDecryptId(key: string, value: string) {
  if (key.search("id") > -1) {
    const indexOfPassword = value.search(/[A-Za-z]|[A-Za-z0-9]/);
    let operation = "=";
    let password = "";

    if (indexOfPassword === 0) {
      if (value.search(/like|LIKE/) > -1) {
        operation = "LIKE";
        password = value.substring(5).trimLeft().trimRight();
      }
    }

    if (operation !== "LIKE") {
      password = value.substring(indexOfPassword - 1).trimLeft().trimRight();

      if (indexOfPassword >= 1)
        operation = value.substring(0, indexOfPassword - 1);
    }

    return `${key} ${operation} ${decryptTextHex(password)}`;
  }

  const firstLetterOrNumber = value.search(/[A-Za-z]|[A-Za-z0-9]/);

  if (value.search(/like|LIKE/) > -1) {
    return `${key} ${value}`;
  }

  if (firstLetterOrNumber >= 1) {
    return `${key} ${value}`;
  }

  return `${key} = ${value}`;
}

const encryptId = (list: AssistanceSearch[]) => {
  return list.map(item => {
    const newItem = { ...item };

    if (item.assistance?.id) {
      const encryptedAssistanceId = encryptTextHex(item.assistance.id);
      newItem.assistance.id = encryptedAssistanceId;
    }

    if (item.assistance?.owner_id) {
      const encryptedOwnerId = encryptTextHex(item.assistance.owner_id);
      newItem.assistance.owner_id = encryptedOwnerId;
    }

    if (item.assistance?.course_id) {
      const encryptedCourseId = encryptTextHex(item.assistance.course_id);
      newItem.assistance.course_id = encryptedCourseId;
    }

    if (item.assistant?.id) {
      const encryptedAssistantId = encryptTextHex(item.assistant.id);
      newItem.assistant.id = encryptedAssistantId;
    }

    if (item.assistantCourse?.id) {
      const encryptedAssistantCourseId = encryptTextHex(item.assistantCourse.id);
      newItem.assistantCourse.id = encryptedAssistantCourseId;
    }

    if (item.assistanceCourse?.id) {
      const encryptedAssistanceCourseId = encryptTextHex(item.assistanceCourse.id);
      newItem.assistanceCourse.id = encryptedAssistanceCourseId;
    }

    if (item.subject?.id) {
      const encryptedSubjectId = encryptTextHex(item.subject.id);
      newItem.subject.id = encryptedSubjectId;
    }

    if (item.address?.id) {
      const encryptedAddressId = encryptTextHex(item.address.id);
      newItem.address.id = encryptedAddressId;
    }

    if (item.address?.assistance_id) {
      const encryptedAddressAssistanceId = encryptTextHex(item.address.assistance_id);
      newItem.address.assistance_id = encryptedAddressAssistanceId;
    }

    return newItem;
  });
};
