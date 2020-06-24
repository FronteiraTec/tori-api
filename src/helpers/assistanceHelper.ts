import { CustomError } from "src/helpers/customErrorHelper";
import * as tagModel from "src/models/tagModel";
import { createTag as assistanceModelCreateTag } from "src/models/assistanceModel";
import { decryptHexId } from "./utilHelper";

export enum QueryOptions {
  all = "all",
  name = "name",
  id = "id",
  tag = "tag"
}

export const addTags = async (assistanceId: string | number, tags: string[]) => {
  const tagsId = [];
  for (const i of Object.keys(tags)) {
    const name = tags[i as keyof typeof tags];

    try {
      const tag = await tagModel.create({
        name: typeof name === "string" ? name.toLowerCase() : name
      });
      if (tag !== undefined)
        tagsId.push(tag.insertId);
    }
    catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        // Search ids in database.
        const tagName = String(tags[i as keyof typeof tags]).toLowerCase();

        const tagIdObject = await tagModel.findByName(tagName);

        if (tagIdObject !== undefined)
          tagsId.push(tagIdObject.id);
      }
      else {
        throw new CustomError({
          error,
          message: "An error occurred while creating the address",
        });
      }
    }
  }
  for (const i of Object.keys(tagsId)) {
    const key = i as keyof typeof tagsId;

    try {
      // const idIsString = tagsId[key] === 'string'
      await assistanceModelCreateTag({
        assistance_id: decryptHexId(assistanceId),
        tag_id: tagsId[key]
      });
    }
    catch (error) {
      throw error;
    }
  }
};
