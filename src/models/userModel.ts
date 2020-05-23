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



function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}
