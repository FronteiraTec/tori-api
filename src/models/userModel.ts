import { db } from "../helpers/dbHelper";
import { user as UserInterface } from "../helpers/dbNamespace";
import crypto from "crypto";
import { toBoolean } from 'src/helpers/conversionHelper';


export const updateOnlyNullFields = async (userId: number, user: UserInterface | Object) => {

  try {
    const result = await
      db.updateOnlyNullFields("user", user)
        .where("user_id", String(userId))
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

    db.where("user_id", String(userId));

    const result = await db.resolve() as { user: UserInterface }[];

    const parsedResult = parseResponse(result);

    return parsedResult.length > 0 ? parsedResult[0] : parsedResult;
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

    db.where("user_email", email);

    const result = await db.resolve() as { user: UserInterface }[];

    const parsedResult = parseResponse(result);

    return parsedResult.length > 0 ? parsedResult[0] : parsedResult;

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

    db.where("user_full_name").like(`%${name}%`);

    const result = await db.resolve() as { user: UserInterface }[];

    const parsedResult = parseResponse(result);

    return parsedResult.length > 0 ? parsedResult[0] : parsedResult;

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
      db.where("user_is_assistant", toBoolean(assistant) ? "1" : "0");

    const result = await db.resolve() as { user: UserInterface }[];

    const parsedResult = parseResponse(result);
    return parsedResult.length > 0 ? parsedResult[0] : parsedResult;

  } catch (err) {
    throw err;
  }
}

export const update = async (userId: number, user: UserInterface | any) => {

  if (user.user_is_assistant)
    user.user_is_assistant = booleanToString(user.user_is_assistant);
  if (user.user_verified_assistant)
    user.user_verified_assistant = booleanToString(user.user_verified_assistant);

  try {
    const result = await
      db.update("user", user)
        .where("user_id", String(userId))
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
        .where("user_id", String(userId))
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
      db.update("user", { user_profile_photo: imagePath })
        .where("user_id", String(userId))
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
      id: data.user.user_id,
      name: data.user.user_full_name,
      createdAt: data.user.user_created_at,
      isAssistant: data.user.user_is_assistant,
      courseId: data.user.user_course_id,
      cpf: data.user.user_cpf,
      matricula: data.user.user_matricula,
      idUffs: data.user.user_idUFFS,
      assistantStars: data.user.user_assistant_stars,
      studentStars: data.user.user_student_stars,
      email: data.user.user_email,
      phone: data.user.user_phone_number,
      // password: data.user.user_password,
      verifiedAssistant: data.user.user_verified_assistant,
      profilePhoto: data.user.user_profile_photo,
    }
  });
}

function defaultReturn() {
  return `
    user_id,
    user_full_name,
    user_created_at,
    user_email
  `;
}