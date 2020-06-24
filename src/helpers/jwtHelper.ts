import { readFileSync } from "fs";
import jwt from "jsonwebtoken";

export const generateJWT = async ({ id, expireTime, secret }: { id: string; expireTime?: string, secret?: string }) => {
  let expiresIn = "";

  if (expireTime === undefined || process.env.NODE_ENV === "production") {
    if (process.env.JWT_EXPIRE_TIME)
      expiresIn = process.env.JWT_EXPIRE_TIME;
  }
  else
    expiresIn = expireTime;

  let secretToSign = "";
  let dataToSign = {};

  if (secret && process.env.NODE_ENV !== "production") {
    secretToSign = secret;
    dataToSign = { expiresIn };
    // expiresDate =
  }
  else {
    // STRING
    if (process.env.JWT_SECRET_STRING) {
      secretToSign = process.env.JWT_SECRET_STRING;
      dataToSign = { expiresIn };
    }
    if (process.env.JWT_SECRET_PRIVATE_KEY) {
      let algorithm;

      if (process.env.JWT_SECRET_PRIVATE_KEY_ALGORITHM) {
        algorithm = readFileSync(process.env.JWT_SECRET_PRIVATE_KEY_ALGORITHM);
      }
      else throw new Error("No JWT_SECRET_PRIVATE_KEY_ALGORITHM provided in .env file");

      secretToSign = process.env.JWT_SECRET_PRIVATE_KEY;
      dataToSign = { expiresIn, algorithm };
    }
  }

  // private.key

  const expires = expiresIntoSeconds(expiresIn);

  try {
    const token = jwt.sign({
      data: { id },
    },
      secretToSign,
      dataToSign
    );
    return { token, expiresIn: expires };
  } catch (err) {
    throw err;
  }
};


export const validateJWT = async ({ token, secret }: { token: string; secret?: string }) => {

  let secretToSign = "";

  if (secret && process.env.NODE_ENV !== "production") {
    secretToSign = secret;
  }
  else {
    // STRING
    if (process.env.JWT_SECRET_STRING) {
      secretToSign = process.env.JWT_SECRET_STRING;
    }
    if (process.env.JWT_SECRET_PRIVATE_KEY) {
      let algorithm;

      if (process.env.JWT_SECRET_PRIVATE_KEY_ALGORITHM) {
        algorithm = readFileSync(process.env.JWT_SECRET_PRIVATE_KEY_ALGORITHM);
      }
      else throw new Error("No JWT_SECRET_PRIVATE_KEY_ALGORITHM provided in .env file");

      secretToSign = process.env.JWT_SECRET_PRIVATE_KEY;
    }
  }

  try {
    const decoded = jwt.verify(token, secretToSign);
    return decoded;
  } catch (err) {
    throw err;
  }
};

function daysToSeconds(days: number) {
  return days * 24 * 60 * 60;
}

function hoursToSeconds(hours: number) {
  return hours * 60 * 60;
}

function expiresIntoSeconds(expiresIn: string) {
  let seconds = 0;

  if (expiresIn.search("d"))
    seconds = daysToSeconds(Number(expiresIn.split("d")[0]));

  else if (expiresIn.search("h"))
    seconds = hoursToSeconds(Number(expiresIn.split("h")[0]));

  else
    seconds = Number(expiresIn);

  const now = new Date();
  const ms = seconds * 1000;

  now.setTime(now.getTime() + ms);

  return now;
}