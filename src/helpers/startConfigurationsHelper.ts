import { createFolder } from './outputHelper';
import { CustomError } from './customErrorHelper';

export const createFolders = () => {
  const imagePath = process.env.PROFILE_PIC_PATH;
  const userQrCodePath = process.env.USER_UNIQUE_QR_CODE_PATH;

  try {
    if (imagePath === undefined) throw new CustomError({ message: "PROFILE_PIC_PATH  not found in env file" });
    createFolder(imagePath);

    if (userQrCodePath === undefined) throw new CustomError({ message: "USER_UNIQUE_QR_CODE_PATH not found in env file" });
    createFolder(userQrCodePath);
    
  } catch (error) {
    throw error;
  }
}