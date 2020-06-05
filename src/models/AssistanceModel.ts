import DbHelper from "../helpers/dbHelper";
import {
  assistance as Assistance,
  assistance_tag as AssistanceTag,
  assistance_presence_list as AssistancePresenceList,
  user as User,
  address as Address,
  tag as Tag,
  subject as Subject,
  course as Course
} from "../helpers/dbNamespace";
import { InsertResponse, DeleteResponse } from 'src/helpers/dbResponses';
import { toBoolean } from 'src/helpers/conversionHelper';

interface AssistanceSearch {
  assistance: Assistance,
  address: Address,
  assistant: User,
  assistanceCourse: Course,
  assistantCourse: Course,
  subject: Subject
}

interface FilterOptions {
  filter?: object,
  limit?: number,
  offset?: number,
  orderBy?: object,
  available?: boolean | string | number
};

export const getAll = async ({ limit, offset, available, order, fields }: { fields: string[] | undefined, order: string, limit: number; offset: number; available: boolean; }) => {
  const db = new DbHelper();

  if (fields)
    fieldSearch(fields, db)
  else {
    defaultSearch(db);
  }

  if (order)
    db.orderBy("assistance_id", order);
  else 
    db.orderBy("assistance_id", "DESC");
  

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

export const searchByID = async ({ id, fields }:
  { fields?: string[], id: number | undefined; }) => {
    
  const db = new DbHelper();
  
  if (fields)
    fieldSearch(fields, db);
  else
    defaultSearch(db);

  db.where("assistance.assistance_id", String(id));

  try {
    const assistance = await db.resolve() as AssistanceSearch[];


    return assistance.length > 0 ? assistance[0] : undefined;
  }
  catch (err) {

    throw err;
  }
};

export const searchByName = async ({ name, fields, args }:
  { fields?: string[], name: string; args?: FilterOptions; }) => {
  
  const db = new DbHelper();


  if (fields)
    fieldSearch(fields, db);
  else
    defaultSearch(db);

  db.where("assistance_title")
    .like(`%${name}%`);


  if (args)
    defaultFilters(args, db);

  try {
    const assistance = await db.resolve() as AssistanceSearch[];

    return assistance.length > 0 ? assistance : undefined;
  }
  catch (err) {
    throw err;
  }
};

export const searchByTag = async ({ tags, fields, args }:
  { fields?: string[], tags?: string[]; args?: FilterOptions; }) => {

    const db = new DbHelper();
  
  if (fields)
    fieldSearch(fields, db);
  else
    defaultSearch(db);

  db.leftJoin("assistance_tag as at at.assistance_id", "assistance.assistance_id")
    .leftJoin("tag.tag_id", "at.tag_id")


  if (tags)
    tags.map((string, i) => {
      if (i == 0)
        db.where("(tag.tag_name")
      else
        db.or("(tag.tag_name")

      db.like(`%${string}%`)
        .or("assistance.assistance_title").like(`%${string}%`)
        .or("assistance.assistance_description").like(`%${string}%`, ')');

    });


  if (args)
    defaultFilters(args, db);

  try {
    const assistance = await db.resolve() as { assistance: Assistance }[];

    return assistance.map((item: { assistance: Assistance }) => item.assistance);
  }
  catch (err) {
    throw err;
  }
};

export const searchByNameTagDescription = async ({ search, fields, args }:
  { fields?: string[], search: string[] | undefined; args?: FilterOptions; }) => {

  const db = new DbHelper();

  if (fields)
    fieldSearch(fields, db);
  else
    defaultSearch(db);

  db.leftJoin("assistance_tag as at at.assistance_id", "assistance.assistance_id")
    .leftJoin("tag.tag_id", "at.tag_id")

  if (search)
    search.map((string, i) => {
      console.log("i = ", i)
      if (i == 0)
        db.where("(tag.tag_name")
      else
        db.or("(tag.tag_name")

      db.like(`%${string}%`)
        .or("assistance.assistance_title").like(`%${string}%`)
        .or("assistance.assistance_description").like(`%${string}%`, ')');

    });
  
  if (args)
    defaultFilters(args, db);

  try {
    const assistance = await db.resolve() as AssistanceSearch[];

    return assistance;
  }
  catch (err) {
    throw err;
  }
};

export const deleteById = async (id: number) => {
  const db = new DbHelper();

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
  const db = new DbHelper();

  try {
    const newAssistance = await db.insert("assistance", assistanceData).resolve() as InsertResponse[];
    return newAssistance[0];
  }
  catch (err) {
    throw err;
  }
};

export const update = async (assistanceId: number | string, assistanceFields: Assistance | Object) => {
  const db = new DbHelper();

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
  const db = new DbHelper();

  try {
    const newTag = await db.insert("assistance_tag", assistanceTag).resolve() as InsertResponse;
    return newTag;
  }
  catch (err) {
    throw err;
  }
};

export const subscribeUser = async (presenceList: AssistancePresenceList | Object): Promise<InsertResponse> => {
  const db = new DbHelper();

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
  const db = new DbHelper();

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
  const db = new DbHelper();

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
  const db = new DbHelper();

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

const fieldSearch = (fields: string[], db: DbHelper) => {
  const fieldsString = fields.join(",");
  db.select(fieldsString);
  db.from("assistance");
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
    db.leftJoin("assistant.user_course_id", "course as assistantCourse assistantCourse.course_id");
  if (address >= 0)
    db.leftJoin("address.address_assistance_id", "assistance.assistance_id");
  if (subject >= 0)
    db.join("subject.subject_id", "assistance.assistance_subject_id");
  return db;
};

const defaultSearch = (db: DbHelper) => {
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
    .leftJoin("assistant.user_course_id", "course as assistantCourse assistantCourse.course_id")
    .join("subject.subject_id", "assistance.assistance_subject_id")
    .leftJoin("address.address_assistance_id", "assistance.assistance_id");

  return db;
};

const defaultFilters = (args: FilterOptions, db: DbHelper) => {
  if (args.limit && args.offset)
    db.pagination(args.limit, args.offset);

  if (args.filter) {
    for (const key in args.filter) {
      const value = args.filter[key as keyof typeof args.filter];

      db.and(key, value);
    }
  }

  if (args.available) {
    if (toBoolean(args.available.toString())){
      db.and("assistance.assistance_available", "1");
      db.and("assistance.assistance_suspended", "0");
    }
    else {
      db.and("assistance.assistance_available", "0");
      db.or("assistance.assistance_suspended", "1");
    }

  }

  if (args.orderBy) {
    for (const key in args.orderBy) {
      const value = args.orderBy[key as keyof typeof args.orderBy];
      db.orderBy(key, value);
      break;
    }
  }
};