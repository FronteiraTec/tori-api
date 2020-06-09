import { createFolder } from './outputHelper';
import { CustomError } from './customErrorHelper';

export const createFolders = () => {
  const imagePath = process.env.PROFILE_PIC_PATH;

  try {
    if (imagePath === undefined) throw new CustomError({ message: "Image path not found in env file" });
    createFolder(imagePath);
  } catch (error) {
    throw error;
  }
}