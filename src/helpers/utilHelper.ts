import { CustomError, ErrorCode } from './customErrorHelper';
import crypto from 'crypto';

export const parseQueryField = (fields?: string) =>{
  if (fields === undefined || fields === "")
    return [];

  return fields.replace(/[\[\]]/g, "")
    .trim()
    .split(",")
    .map((field: string) => `${field.trim()}`);
}

export const currentDate = () => {
  /* cspell: disable-next-line */
  const date = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/[\/]/g, "-").replace(",", "").trim()
    .split("-");
  const time = date[2].split(" ");
  return `${time[0]}-${date[0]}-${date[1]} ${time[1]}`;
}

export const allowedFields = (fields: string[]) => {
  const availableSearchFields = [
    "assistance.id",
    "assistance.title",
    "assistance.description",
    "assistance.available",
    "assistance.total_vacancies",
    "assistance.available_vacancies",
    "assistance.date",
    "assistanceCourse.name",
    "assistanceCourse.description",
    "assistanceCourse.id",
    "subject.id",
    "subject.name",
    "subject.description",
    "assistant.id",
    "assistant.full_name",
    "assistant.created_at",
    "assistant.assistant_stars",
    "assistant.email",
    "assistant.course_id",
    "assistantCourse.id",
    "assistantCourse.name",
    "assistantCourse.description",
    "address.cep",
    "address.street",
    "address.number",
    "address.complement",
    "address.reference",
    "address.nickname",
    "address.latitude",
    "address.longitude",
    "address.assistance_id",
    "user.full_name",
    "user.created_at",
    "user.student_stars",
    "user.email",
    "user.course_id",
    "userCourse.id",
    "userCourse.name",
    "userCourse.description",
    "student.full_name",
    "student.created_at",
    "user.is_assistant",
    "user.id",  
    "student.student_stars",
    "student.email",
    "student.course_id",
    "studentCourse.id",
    "studentCourse.name",
    "studentCourse.description"
  ];

  for (const field of fields) {
    let verifier = false;
    for (const allowed of availableSearchFields)
      verifier = verifier || (allowed === field);
    if (verifier === false)
      return false;
  }
  return true;
}

export const notAllowedFieldsSearch = (fields?: string[]) => {
  if (fields === undefined)
    return true;
  const notAllowedFields = [
    "user_id",
    "user_created_at",
    /* cspell: disable-next-line */
    "user_matricula",
    /* cspell: disable-next-line */
    "user_idUFFS",
    "user_email",
    "user_phone_number",
    "user_password",
    "user_cpf"
  ];
  for (const field of fields) {
    for (const notAllowed of notAllowedFields) {
      if (field === notAllowed || `user.${notAllowed}` === notAllowed)
        return true;
    }
  }
  return false;
}


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

export const decryptText = (encryptedText: string | number | undefined, base?: BaseEnumEncryptOptions) => {
  if (encryptedText === null || encryptedText === undefined || encryptedText === '') {
    throw new CustomError({
      code: ErrorCode.INVALID_ID
    });
  }
  
  const config = getCryptConfigAES();

  const decipher = crypto.createDecipheriv('aes-256-cbc', config.cryptKey, config.iv)

  try {
    return Buffer.concat([
      decipher.update(encryptedText.toString(), base ? base : 'base64'), // Expect `text` to be a base64 string
      decipher.final()
    ]).toString();
  } catch (error) {
    throw error;
  }
};

export const encryptTextHex = (text: number | string) => {
  return encryptText(text, BaseEnumEncryptOptions.hex);
};

export const decryptTextHex = (encryptedText: string | number | undefined) => {
    return decryptText(encryptedText, BaseEnumEncryptOptions.hex);

};

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


export const decryptHexId = (id: string | number) => {
  return Number(decryptTextHex(id));
};

export const booleanToString = (string?: string) => {
  if (string === undefined) return undefined;

  if (string === "false") return "0";
  if (string === "0") return "0";

  return "1";
};

export const hashPassword = (password: string | number) => {
  if(typeof password === "string")
    return crypto.createHash("sha256").update(password).digest("hex");
  else
    return crypto.createHash("sha256").update(password.toString()).digest("hex");
};

export const capitalizeFirstLetter = (text: string) => {
  return text.toLowerCase().split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
};