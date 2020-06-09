import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';


export const createImageName = ({ userId, extension, imagePath }: { userId: number; extension: any; imagePath: string; }) => {
  const imageName = crypto.createHash('md5')
    .update(userId.toString()).
    digest("hex") + `.${extension}`;

  return path.join(imagePath, imageName);
};

export const createFolder = ( path: string ) => {
  mkdirSync(path, { recursive: true });
};

export const saveImageFromBase64 = ({ path, base64String }: { path: string; base64String: string; }) => {
  try {
    writeFileSync(path, decodeBase64Image(base64String), { encoding: 'base64' });
  } catch (err) {
    throw err;
  }
}

export const decodeBase64Image = (base64String: string) => {
  if (base64String.startsWith("data:image")) {
    return base64String.split(';base64,').pop();
  }
  else {
    return base64String
  }
}