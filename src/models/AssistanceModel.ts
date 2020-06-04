import DbHelper, { db } from "../helpers/dbHelper";
import {
  assistance as Assistance,
  assistance_tag as AssistanceTag,
  assistance_presence_list as AssistancePresenceList,
  user as User
} from "../helpers/dbNamespace";
import { InsertResponse, DeleteResponse } from 'src/helpers/dbResponses';

interface FilterOptions {
  filter?: string,
  limit?: number,
  offset?: number,
  filterData?: string,
  orderBy?: string,
  orderByData?: string,
  available?: boolean
};

export const getAll = async ({ limit, offset, available, order, fields }: { fields: string[] | undefined, order: string, limit: number; offset: number; available: boolean; }) => {
  if (fields) {
    console.log(fields);
    const fieldsString = fields.join(",");

    db.select(fieldsString)
    db.from("assistance")

    const address = fieldsString.search("address.");
    const assistant = fieldsString.search("assistant.");
    const assistanceCourse = fieldsString.search("assistanceCourse.");
    const assistantCourse = fieldsString.search("assistantCourse.");
    const subject = fieldsString.search("subject.");

    if (assistant >= 0)
      db.join("assistance.assistance_owner_id", "user as assistant assistant.user_id");

    if (assistanceCourse >= 0)
      db.join("assistance.assistance_course_id", "course as assistanceCourse assistanceCourse.course_id");

    if (assistantCourse >= 0)
      db.join("assistant.user_course_id", "course as assistantCourse assistantCourse.course_id");


    if (address >= 0)
      db.leftJoin("address.address_assistance_id", "assistance.assistance_id");

    if (subject >= 0)
      db.join("subject.subject_id", "assistance.assistance_subject_id");

  }
  else {
  defaultSearch(db);
}

if (order)
  db.orderBy("assistance_id", order ? order : "DESC");


if (available !== undefined) {
  if (Boolean(available) === true)
    db.where("assistance_available", String(available));
}

if (limit !== undefined && offset !== undefined)
  db.pagination(limit, offset);


try {
  const rowsAndInfos = await db.resolve();
  return rowsAndInfos;
}
catch (err) {
  throw err;
}
}

export const searchByID = async ({ id, select }: { id: number, select?: string }) => {

  if (select !== undefined)
    db.select(select).from("assistance");
  else
    defaultSearch(db);

  db.where("assistance_id", String(id));

  try {
    const assistance = await db.resolve() as { assistance: Assistance }[];


    if (select !== undefined)
      return assistance[0] !== undefined ? assistance[0].assistance : undefined;


    return assistance.map((item: { assistance: Assistance }) => item.assistance);
  }
  catch (err) {

    throw err;
  }
};

export const searchByName = async (name: string, args: FilterOptions) => {
  defaultSearch(db).
    where("assistance_title").
    like(`%${name}%`);

  defaultFilters(args);

  try {
    const assistance = await db.resolve() as { assistance: Assistance }[];

    return assistance.map((item: { assistance: Assistance }) => item.assistance);

  }
  catch (err) {
    throw err;
  }
};

export const searchByTag = async (name: string, args: FilterOptions) => {
  defaultSearch(db).
    leftJoin("assistance_tag as at at.assistance_id", "assistance.assistance_id").
    leftJoin("tag.tag_id", "at.tag_id").
    where("tag.tag_name").
    like(`%${name}%`);

  defaultFilters(args);

  try {
    const assistance = await db.resolve() as { assistance: Assistance }[];

    return assistance.map((item: { assistance: Assistance }) => item.assistance);
  }
  catch (err) {
    throw err;
  }
};

export const searchByNameTagDescription = async (name: string, args: FilterOptions) => {
  defaultSearch(db).
    leftJoin("assistance_tag as at at.assistance_id", "assistance.assistance_id").
    leftJoin("tag.tag_id", "at.tag_id").
    where("(tag.tag_name").
    like(`%${name}%`).
    or("assistance.assistance_title").like(`%${name}%`).
    or("assistance.assistance_description").like(`%${name}%`, ')');

  defaultFilters(args);

  try {
    const assistance = await db.resolve() as { assistance: Assistance }[];

    return assistance.map((item: { assistance: Assistance }) => item.assistance);


  }
  catch (err) {
    throw err;
  }
};

export const deleteById = async (id: number) => {
  db.delete("assistance")
    .where("assistance_id", id.toString());

  try {
    return db.resolve();
  }
  catch (err) {
    throw err;
  }
};

export const create = async (assistanceData: Assistance | Object): Promise<InsertResponse> => {
  try {
    const newAssistance = await db.insert("assistance", assistanceData).resolve() as InsertResponse[];
    return newAssistance[0];
  }
  catch (err) {
    throw err;
  }
};

export const update = async (assistanceId: number, assistanceFields: Assistance | Object) => {

  try {
    const result = await
      db.update("assistance", assistanceFields)
        .where("assistance_id", String(assistanceId))
        .resolve();

    return result;
  } catch (err) {
    throw err;
  }
};




export const createTag = async (assistanceTag: AssistanceTag | Object): Promise<InsertResponse> => {
  try {
    const newTag = await db.insert("assistance_tag", assistanceTag).resolve() as InsertResponse;
    return newTag;
  }
  catch (err) {
    throw err;
  }
};


export const subscribeUser = async (presenceList: AssistancePresenceList | Object): Promise<InsertResponse> => {
  try {
    const newPresenceList = await db
      .insert("assistance_presence_list", presenceList)
      .resolve() as InsertResponse;
    return newPresenceList;
  }
  catch (err) {
    throw err;
  }
};

export const findAllSubscribedUsers = async (assistanceId: number, select: string) => {
  try {
    const res = await db
      .select(select)
      .from("assistance_presence_list")
      .join("user.user_id", "assistance_presence_list.student_id")
      .where("assistance_presence_list.assistance_id", assistanceId.toString())
      .resolve() as { user: User, assistance_presence_list: AssistancePresenceList }[];

    return res.length > 0 ? [...res] : undefined;
  }
  catch (err) {
    throw err;
  }
};


export const findSubscribedUsersByID = async ({ userId, assistanceId }: { userId: number; assistanceId: number; }) => {
  try {
    const user = await db
      .select()
      .from("assistance_presence_list")
      .where("student_id", userId.toString())
      .and("assistance_id", assistanceId.toString())
      .resolve() as { assistance_presence_list: AssistancePresenceList }[];

    return user.length > 0 ? user[0].assistance_presence_list : undefined;
  }
  catch (err) {
    throw err;
  }
};

export const unsubscribeUsersByID = async ({ userId, assistanceId }: { userId: number; assistanceId: number; }) => {
  try {
    const user = await db
      .delete("assistance_presence_list")
      .where("student_id", userId.toString())
      .and("assistance_id", assistanceId.toString())
      .resolve() as DeleteResponse[];

    return user.length > 0 ? user[0] : undefined;
  }
  catch (err) {
    throw err;
  }
};

function defaultSearch(db: DbHelper) {
  db.
    from("assistance").
    select(`
        assistance.*,
        assistant.user_id,
        assistant.user_full_name,
        assistant.user_created_at,
        assistant.user_assistant_stars,
        assistant.user_email,
        assistant.user_verified_assistant,
        assistant.user_course_id,
        assistanceCourse.course_name,
        assistanceCourse.course_description,
        assistanceCourse.course_id,
        assistantCourse.course_id,
        assistantCourse.course_name,
        assistantCourse.course_description,
        subject.subject_id,
        subject.subject_name,
        subject.subject_description,
        address.*
      `)

    .join("assistance.assistance_owner_id", "user as assistant assistant.user_id")
    .join("assistance.assistance_course_id", "course as assistanceCourse assistanceCourse.course_id")
    .join("assistant.user_course_id", "course as assistantCourse assistantCourse.course_id")
    .join("subject.subject_id", "assistance.assistance_subject_id")
    .leftJoin("address.address_assistance_id", "assistance.assistance_id");

  return db;
}

function defaultFilters(args: FilterOptions) {
  if (args.limit !== undefined && args.offset !== undefined)
    db.pagination(args.limit, args.offset);
  if (args.filter !== undefined) {
    if (args.filter.search("course") >= 0) {
      const field = args.filter.split("-")[1];
      const query = `course.course_${field}`;

      const filterData = args.filterData === undefined ? "" : args.filterData;
      db.and(query, filterData);
    }
  }

  if (args.available !== undefined) {
    if (Boolean(args.available) === true)
      db.and("assistance_available", String(1));
  }

  if (args.orderBy !== undefined) {
    const sortOrder = args.orderByData === undefined ? "ASC" : args.orderByData;
    db.orderBy(`assistance.assistance_${args.orderBy}`, sortOrder);
  }
}
