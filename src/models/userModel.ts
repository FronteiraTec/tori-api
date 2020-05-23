import { db } from "../helpers/dbHelper";
import { user as UserInterface } from "../helpers/dbNamespace";
import crypto from "crypto";


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


export const getById = async ({ userId }: { userId: number }) => {

  // try {
  //   const result = await
  //   db.updateOnlyNullFields("user", user)
  //   .where("user_id", String(userId))
  //   .resolve();

  //   return result;
  // } catch (err) {
  //   throw err;
  // }
}

export const getByEmail = async ({ email }: { email: string }) => {

  // try {
  //   const result = await
  //   db.updateOnlyNullFields("user", user)
  //   .where("user_id", String(userId))
  //   .resolve();

  //   return result;
  // } catch (err) {
  //   throw err;
  // }
}

export const getByName = async ({ name }: { name: string }) => {

  // try {
  //   const result = await
  //   db.updateOnlyNullFields("user", user)
  //   .where("user_id", String(userId))
  //   .resolve();

  //   return result;
  // } catch (err) {
  //   throw err;
  // }
}

export const getAll = async ({ assistant, limit, offset, fields }:
  { assistant?: string, limit: number, offset: number, fields?: string }) => {

  try {

    if (fields !== undefined)
      db.select(fields);
    else
      db.select(defaulReturn());

    db.from("user");

    if (limit && offset)
      db.pagination(limit, offset);

    if (assistant !== undefined)
      db.where("user_is_assistant", toBoolean(assistant) ? "1" : "0");

    // console.log(db.query)

    const result = await db.resolve() as {user: UserInterface} [];

    return parseResponse(result);
  } catch (err) {
    throw err;
  }
}


function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}


function toBoolean(string: string) {
  if (string === "false") return false;
  if (string === "0") return false;
  if (string === undefined) return false;
  return true;
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

interface DefaultResponse {
  id: number,
  fullName: string,
  createdAt: Date,
  stars: number,
  email: string,
  verifiedAssistant: boolean,
}

function defaulReturn(){
  return `
    user_id,
    user_full_name,
    user_created_at,
    user_email
  `;
}