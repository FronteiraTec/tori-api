import { CustomError } from 'src/helpers/customErrorHelper';
import * as tagModel from 'src/models/tagModel';
import { createTag as assistanceModelCreateTag } from 'src/models/assistanceModel';

export enum QueryOptions {
    all = "all",
    name = "name",
    id = "id",
    tag = "tag"
};

export const addTags = async (tags: string[]) => {
    const tagsId = [];
    for (const i in tags) {
        try {
            const tag = await tagModel.create({
                tag_name: tags[i].toLowerCase()
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
            await assistanceModelCreateTag({
                assistance_id: 1,
                tag_id: tagsId[i]
            });
        }
        catch (error) {
            throw error;
        }
    }
};
