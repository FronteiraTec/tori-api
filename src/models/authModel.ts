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
      id: newUser[0].insertId,
      name
    } as { id: string, name: string }
  } catch (err) {
    throw err;
  }




}


export const signIn = async () => { }
export const signInUFFS = async () => { }

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
