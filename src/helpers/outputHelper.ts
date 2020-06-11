import { writeFileSync, mkdirSync } from 'fs';
import path, { join } from 'path';
import crypto from 'crypto';
import qrCode from "qrcode";


export const createImageName = ({ userId, extension, imagePath }: { userId: number; extension: any; imagePath: string; }) => {
  const imageName = crypto.createHash('md5')
    .update(userId.toString()).
    digest("hex") + `.${extension}`;

  return path.join(imagePath, imageName);
};

export const createFolder = (path: string) => {
  mkdirSync(path, { recursive: true });
};

export const saveImageFromBase64 = ({ path, base64String }: { path: string; base64String: string; }) => {
  try {
    writeFileSync(path, decodeBase64Image(base64String), { encoding: 'base64' });
  } catch (err) {
    throw err;
  }
};

export const decodeBase64Image = (base64String: string) => {
  if (base64String.startsWith("data:image")) {
    return base64String.split(';base64,').pop();
  }
  else {
    return base64String
  }
};

export const generateQrCode = (data: string | object) => {

};

export const qrCodeToFile = (savePath: string, saveContent: string, opts?: object) => {
  return new Promise((resolve, reject) => {
    if (opts === undefined) {
      opts = {
        color: {
          light: '#0000',
        },
        width: 1000,
        errorCorrectionLevel: 'H'
      }
    };

    qrCode.toFile(savePath, saveContent, opts, err => {
      if (err) reject(err);
      resolve();
    });
  });
};

export const saveUserUniqueQrCodeFromRawId = async (userId: string | number, savePath?: string) => {
  if (savePath === undefined) {
    savePath = process.env.USER_UNIQUE_QR_CODE_PATH;
  }
  if (savePath === undefined) {
    throw new Error("QRCODE path is not configured on .env file");
  }

  const toSave = encryptText(userId);
  const encryptId = encryptText(userId, BaseEnumEncryptOptions.hex);
  const fileName = encryptId + ".png";

  try {
    await qrCodeToFile(join(savePath, fileName), toSave);
    return encryptId;
  }
  catch (err) {
    throw err;
  }
};

export const encryptText = (text: number | string, base?: BaseEnumEncryptOptions) => {
  const config = getCryptConfigAES();
  const cipher = crypto.createCipheriv('aes-256-cbc', config.cryptKey, config.iv)
  const textBuffer = Buffer.from(String(text));

  try {
    return Buffer.concat([
      cipher.update(textBuffer),
      cipher.final()
    ]).toString(base ? base : 'base64');
  } catch (error) {
    throw error;
  }
};

export const decryptText = (encryptedText: string, base?: BaseEnumEncryptOptions) => {
  if (encryptedText === null || encryptedText === undefined || encryptedText === '') {
    return encryptedText;
  }
  
  const config = getCryptConfigAES();

  const decipher = crypto.createDecipheriv('aes-256-cbc', config.cryptKey, config.iv)

  try {
    return Buffer.concat([
      decipher.update(encryptedText, base ? base : 'base64'), // Expect `text` to be a base64 string
      decipher.final()
    ]).toString();
  } catch (error) {
    return undefined;
  }
};

export const getQrCodePath = () => {
  return process.env.USER_UNIQUE_QR_CODE_PATH?.split("src/")[1];
}

const getCryptConfigAES = () => {
  const password = process.env.CRYPT_AES_PASSWORD;

  if (password === undefined) {
    throw new Error("CRYPT_AES_PASSWORD is not configured on .env file");
  }

  return {
    cryptKey: crypto.createHash('sha256').update(password).digest(),
    iv: 'a2xhCgAAAAAAAAAA'
  };
};


export enum BaseEnumEncryptOptions {
  base64 = "base64",
  hex = "hex"
}