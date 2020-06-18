import { CustomError } from 'src/helpers/customErrorHelper';
import * as tagModel from 'src/models/tagModel';
import { createTag as assistanceModelCreateTag } from 'src/models/assistanceModel';
import { decryptHexId } from './utilHelper';

export enum QueryOptions {
  all = "all",
  name = "name",
  id = "id",
  tag = "tag"
};

export const addTags = async (assistanceId: string | number, tags: string[]) => {
  const tagsId = [];
  for (const i in tags) {
    try {
      const tag = await tagModel.create({
        name: tags[i].toLowerCase()
      });
      if (tag !== undefined)
        tagsId.push(tag.insertId);
    }
    catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        // Search ids in database.
        const tagIdObject = await tagModel.findByName(tags[i].toLowerCase());
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
  for (const i in tagsId) {
    try {
      const idIsString = assistanceId === "string"
      await assistanceModelCreateTag({
        assistance_id: idIsString ? decryptHexId(assistanceId) : assistanceId,
        tag_id: tagsId[i]
      });
    }
    catch (error) {
      throw error;
    }
  }
};
