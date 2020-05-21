import { db } from "../helpers/dbHelper";
import { user as UserInterface } from "../helpers/dbNamespace";
import crypto from "crypto";


export const signUp = async ({ name, cpf, email, password }: { name: string; cpf: string; email: string; password: string; }) => {
  const hashedPassword = hashPassword(password);

  try {
    const newUser = await db.insert("user", {
      user_cpf: cpf,
      user_email: email,
      user_password: hashedPassword,
      user_full_name: name
    } as UserInterface)
      .resolve() as { insertId: string }[];

    return {
      id: Number(newUser[0].insertId),
      name
    } as { id: number, name: string }
  } catch (err) {
    throw err;
  }




}

export const signIn = async ({ email, password }: { email: string; password: string; }) => {
  const hashedPassword = hashPassword(password);


  try {
    const user = await db.select("user_full_name, user_id")
      .from("user")
      .where("user_email", email)
      .and("user_password", hashedPassword)
      .resolve() as { user: UserInterface }[];

    if (user[0] !== undefined)
      return {
        name: user[0].user.user_full_name,
        id: user[0].user.user_id
      };

    return null;

  } catch (err) {
    throw err;
  }
}
export const signInUFFS = async () => { }

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
