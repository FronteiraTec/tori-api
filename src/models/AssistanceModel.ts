import { db } from "../helpers/dbHelper";
import { 
  assistance as Assistance, 
  assistance_tag as AssistanceTag ,
  assistance_presence_list as AssistancePresenceList
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

export const getAll = async (limit: number, offset: number, available: boolean): Promise<object[]> => {
  defaultSearch().
    orderBy("assistance_id", "DESC");

  if (available !== undefined) {
    if (Boolean(available) === true)
      db.where("assistance_available", String(available));
  }

  if (limit !== undefined && offset !== undefined)
    db.pagination(limit, offset);


  try {
    const rowsAndInfos = await db.resolve();
    return parseDefaultData(rowsAndInfos);
  }
  catch (err) {
    throw err;
  }
}

export const searchByID = async ({ id, select }: { id: number, select?: string }) => {

  if (select !== undefined)
    db.select(select).from("assistance");
  else
    defaultSearch();

  db.where("assistance_id", String(id));

  try {
    const assistance = await db.resolve() as { assistance: Assistance }[];


    if (select !== undefined) 
      return assistance[0] !== undefined ? assistance[0].assistance : undefined;

    const parsedData = parseDefaultData(assistance);

    return parsedData[0];
  }
  catch (err) {

    throw err;
  }
};

export const searchByName = async (name: string, args: FilterOptions): Promise<DefaultResponse[]> => {
  defaultSearch().
    where("assistance_title").
    like(`%${name}%`);

  defaultFilters(args);

  try {
    const assistance = await db.resolve();
    const parsedData = parseDefaultData(assistance);

    return parsedData;
  }
  catch (err) {
    throw err;
  }
};

export const searchByTag = async (name: string, args: FilterOptions): Promise<DefaultResponse[]> => {
  defaultSearch().
    leftJoin("assistance_tag as at at.assistance_id", "a.assistance_id").
    leftJoin("tag.tag_id", "at.tag_id").
    where("tag.tag_name").
    like(`%${name}%`);

  defaultFilters(args);

  try {
    const assistance = await db.resolve();
    const parsedData = parseDefaultData(assistance);

    return parsedData;
  }
  catch (err) {
    throw err;
  }
};

export const searchByNameTagDescription = async (name: string, args: FilterOptions): Promise<DefaultResponse[]> => {
  defaultSearch().
    leftJoin("assistance_tag as at at.assistance_id", "a.assistance_id").
    leftJoin("tag.tag_id", "at.tag_id").
    where("(tag.tag_name").
    like(`%${name}%`).
    or("a.assistance_title").like(`%${name}%`).
    or("a.assistance_description").like(`%${name}%`, ')');

  defaultFilters(args);

  try {
    const assistance = await db.resolve();
    const parsedData = parseDefaultData(assistance);

    return parsedData;
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
    catch(err) {
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

export const findSubscribedUsersByID = async ({ userId, assistanceId }: { userId: number; assistanceId: number; }) => {
  try {
    const user = await db
    .select()
    .from("assistance_presence_list")
    .where("student_id", userId.toString())
    .and("assistance_id", assistanceId.toString())
    .resolve() as {assistance_presence_list: AssistancePresenceList}[];

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



function parseDefaultData(data: any): DefaultResponse[] {
  return data.map((value: any) => {
    return {
      assistance: {
        id: value.a.assistance_id,
        title: value.a.assistance_title,
        description: value.a.assistance_description,
        available: value.a.assistance_available,
        total_vacancies: value.a.assistance_total_vacancies,
        available_vacancies: value.a.assistance_available_vacancies,
        date: value.a.assistance_date,
        subjectName: value.a.assistance_subjectName,
        course: {
          id: value.assc.course_id,
          name: value.assc.course_name,
          description: value.assc.course_description,
        },
        owner: {
          id: value.u.user_id,
          fullName: value.u.user_full_name,
          createdAt: value.u.user_created_at,
          stars: value.u.user_assistant_stars,
          email: value.u.user_assistant_email,
          verifiedAssistant: value.u.user_verified_assistant,
          course: {
            id: value.owc.course_id,
            name: value.owc.course_name,
            description: value.owc.course_description,
          },
        },
        address: {
          id: value.ad.address_id,
          cep: value.ad.address_cep,
          street: value.ad.address_street,
          number: value.ad.address_number,
          complement: value.ad.address_complement,
          reference: value.ad.address_reference,
          nickname: value.ad.address_nickname,
          latitude: value.ad.address_latitude,
          longitude: value.ad.address_longitude,
        },
      }
    }
  });
}
function defaultSearch() {
  db.
    from("assistance as a").
    select(`
        a.*,
        u.user_id,
        u.user_full_name,
        u.user_created_at,
        u.user_assistant_stars,
        u.user_email,
        u.user_verified_assistant,
        u.user_course_id,
        assc.course_name,
        assc.course_description,
        assc.course_id,
        ad.address_id,
        ad.address_cep,
        ad.address_street,
        ad.address_number,
        ad.address_complement,
        ad.address_reference,
        ad.address_nickname,
        ad.address_latitude,
        ad.address_longitude,
        owc.course_id,
        owc.course_name,
        owc.course_description,
        sub.subject_id,
        sub.subject_name,
        sub.subject_description
      `).
    join("a.assistance_owner_id", "user as u u.user_id").
    join("a.assistance_course_id", "course as assc assc.course_id").
    join("a.assistance_local_id", "address as ad ad.address_id").
    join("u.user_course_id", "course as owc owc.course_id").
    join("a.assistance_subject_id", "subject as sub sub.subject_id");

  return db;
}


function defaultFilters(args: FilterOptions) {
  if (args.limit !== undefined && args.offset !== undefined)
    db.pagination(args.limit, args.offset);
  if (args.filter !== undefined) {
    if (args.filter.search("course") >= 0) {
      const field = args.filter.split("-")[1];
      const query = `assc.course_${field}`;

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
    db.orderBy(`a.assistance_${args.orderBy}`, sortOrder);
  }
}


interface DefaultResponse {
  assistance: {
    id: number,
    title: string,
    description: string,
    available: boolean,
    total_vacancies: number,
    available_vacancies: number,
    date: Date,
    subjectName: string,
    course: {
      id: number,
      name: string,
      description: string,
    },
    owner: {
      id: number,
      fullName: string,
      createdAt: Date,
      stars: number,
      email: string,
      verifiedAssistant: boolean,
      course: {
        id: number,
        name: string,
        description: string,
      },
    },
    address: {
      id: number,
      cep: string,
      street: string,
      number: number,
      complement: string,
      reference: string,
      nickname: string,
      latitude: string,
      longitude: string,
    }
  }
}