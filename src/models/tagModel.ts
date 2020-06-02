import { db } from "../helpers/dbHelper";
import { tag as Tag } from "../helpers/dbNamespace";
import { InsertResponse } from 'src/helpers/dbResponses';

export const create = async (tag: Tag | Object) => {
  try {
    const result = await
      db.insert("tag", tag).resolve();

    return result[0] as InsertResponse;
  } catch (err) {
    throw err;
  }
}

export const findByName = async (tagName: string) => {
  const lowerName = tagName.toLowerCase();

  try {
    const result = await
      db.select("tag_id")
        .from("tag")
        .where("tag_name", lowerName)
        .resolve() as { tag: Tag }[];

    return result[0].tag;
  } catch (err) {
    throw err;
  }
}

export const deleteById = async (tagId: number) => {
  try {
    const res = await db.from("tag")
      .delete()
      .where("tag_id", tagId.toString())
      .resolve();
    return res;
  } catch (err) {
    throw err;
  }
}