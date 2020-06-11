import { db } from "../helpers/dbHelper";
import { tag as Tag } from "../helpers/dbNamespaceHelper";
import { InsertResponse } from 'src/helpers/dbResponsesHelper';
import { encryptTextHex } from 'src/helpers/utilHelper';

export const create = async (tag: Tag | Object) => {
  try {
    const result = await
      db.insert("tag", tag).resolve();

    return result.length > 0 ? result[0] as InsertResponse : undefined;
  } catch (err) {
    throw err;
  }
}

export const findByName = async (tagName: string) => {
  const lowerName = tagName.toLowerCase();

  try {
    const result = await
      db.select("id")
        .from("tag")
        .where("name", lowerName)
        .resolve() as { tag: Tag }[];

    return result.length > 0 ? result[0].tag : undefined;
  } catch (err) {
    throw err;
  }
}

export const deleteById = async (tagId: number | string) => {
  try {
    const res = await db.from("tag")
      .delete()
      .where("id", encryptTextHex(tagId))
      .resolve();
    return res;
  } catch (err) {
    throw err;
  }
}