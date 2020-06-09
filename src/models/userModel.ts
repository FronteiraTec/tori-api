import { db } from "../helpers/dbHelper";
import { user as UserInterface } from "../helpers/dbNamespaceHelper";
import crypto from "crypto";
import { toBoolean } from 'src/helpers/conversionHelper';


export const updateOnlyNullFields = async (userId: number, user: UserInterface | Object) => {

  try {
    const result = await
      db.updateOnlyNullFields("user", user)
        .where("id", String(userId))
        .resolve();

    return result;
  } catch (err) {
    throw err;
  }
}


export const getById = async ({ userId, fields }: { userId: number, fields?: string }) => {
  try {

    if (fields !== undefined)
      db.select(fields);
    else
      db.select(defaultReturn());

    db.from("user");

    db.where("id", String(userId));

    const result = await db.resolve() as { user: UserInterface }[];

    // const parsedResult = parseResponse(result);

    return [...result];
  } catch (err) {
    throw err;
  }

}

export const getByEmail = async ({ email, fields }: { email: string, fields?: string }) => {
  try {

    if (fields !== undefined)
      db.select(fields);
    else
      db.select(defaultReturn());

    db.from("user");

    db.where("email", email);

    const result = await db.resolve() as { user: UserInterface }[];

    const parsedResult = parseResponse(result);

    // return parsedResult.length > 0 ? parsedResult[0] : parsedResult;
    // const result = await db.resolve() as { user: UserInterface }[];
    return [...result];



  } catch (err) {
    throw err;
  }
}

export const getWhere = async ({ key, value, fields }: { key: string, value: string | number, fields?: string }) => {

  try {

    if (fields !== undefined)
      db.select(fields);
    else
      db.select(defaultReturn());

    db.from("user");

    db.where(key, value);

    const result = await db.resolve() as { user: UserInterface }[];

    // return parsedResult.length > 0 ? parsedResult[0] : parsedResult;
    // const result = await db.resolve() as { user: UserInterface }[];
    return [...result];



  } catch (err) {
    throw err;
  }
}

export const getByName = async ({ name, fields }: { name: string, fields?: string }) => {
  try {

    if (fields !== undefined)
      db.select(fields);
    else
      db.select(defaultReturn());

    db.from("user");

    db.where("full_name").like(`%${name}%`);

    const result = await db.resolve() as { user: UserInterface }[];

    // const parsedResult = parseResponse(result);

    // return parsedResult.length > 0 ? parsedResult[0] : parsedResult;

    return [...result];

  } catch (err) {
    throw err;
  }
}

export const getAll = async ({ assistant, limit, offset, fields }:
  { assistant?: string, limit: number, offset: number, fields?: string }) => {

  try {

    if (fields !== undefined)
      db.select(fields);
    else
      db.select(defaultReturn());

    db.from("user");

    if (limit && offset)
      db.pagination(limit, offset);

    if (assistant !== undefined)
      db.where("is_assistant", toBoolean(assistant) ? "1" : "0");

    const result = await db.resolve() as { user: UserInterface }[];

    // const parsedResult = parseResponse(result);
    
    // return parsedResult.length > 0 ? parsedResult[0] : parsedResult;
    return [...result];

  } catch (err) {
    throw err;
  }
}

export const update = async (userId: number, user: UserInterface | any) => {

  if (user.is_assistant)
    user.is_assistant = booleanToString(user.is_assistant);
  if (user.verified_assistant)
    user.verified_assistant = booleanToString(user.verified_assistant);

  try {
    const result = await
      db.update("user", user)
        .where("id", String(userId))
        .resolve();

    return result;
  } catch (err) {
    throw err;
  }
}

export const deleteById = async (userId: number) => {
  try {
    const result = await
      db.delete()
        .from("user")
        .where("id", String(userId))
        .resolve();

    return result;
  } catch (err) {
    // console.log(err);
    throw err;
  }
}

export const updateProfilePicture = async ({ userId, imagePath }: { userId: number, imagePath: string }) => {
  try {
    const result = await
      db.update("user", { profile_picture: imagePath })
        .where("id", String(userId))
        .resolve();

    return result;
  } catch (err) {
    throw err;
  }
}


function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}


function booleanToString(string?: string) {
  if (string === undefined) return undefined;

  if (string === "false") return "0";
  if (string === "0") return "0";

  return "1";
}

function parseResponse(data: { user: UserInterface }[]) {
  return data.map(data => {
    return {
      id: data.user.id,
      name: data.user.full_name,
      createdAt: data.user.created_at,
      isAssistant: data.user.is_assistant,
      courseId: data.user.course_id,
      cpf: data.user.cpf,
      matricula: data.user.matricula,
      idUffs: data.user.idUFFS,
      assistantStars: data.user.assistant_stars,
      studentStars: data.user.student_stars,
      email: data.user.email,
      phone: data.user.phone_number,
      // password: data.user.password,
      verifiedAssistant: data.user.verified_assistant,
      profilePhoto: data.user.profile_picture,
    }
  });
}

function defaultReturn() {
  return `
    id,
    full_name,
    created_at,
    email
  `;
}