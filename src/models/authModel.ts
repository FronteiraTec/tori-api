import dbHelper from "../helpers/dbHelper";
import { user as User } from "../helpers/dbNamespaceHelper";

import {
  getTokenFromStudentPortal,
  getIdUFFS,
  getUserInfo,
  getUserPictureFromMoodle
} from "src/helpers/loginUffsHelper";
import { encryptTextHex, capitalizeFirstLetter, hashPassword } from "src/helpers/utilHelper";



enum AuthenticatorType {
  email,
  idUFFS,
  cpf
}

export const signUp = async ({ name, cpf, authenticator, password, idUffs, profile_picture }:
  { name: string; cpf: string; authenticator: string; password: string; profile_picture?: string; idUffs?: string }) => {

    const db = new dbHelper();

  const hashedPassword = hashPassword(password);

  const newUserData = {
    cpf,
    email: authenticator,
    password: hashedPassword,
    full_name: name,
  } as User;

  if (idUffs)
    newUserData.idUFFS = idUffs;
  if (profile_picture)
    newUserData.profile_picture = profile_picture;

  const newUser = await db.insert("user", newUserData)
    .resolve() as { insertId: string }[];

  return {
    id: encryptTextHex(newUser[0].insertId),
    full_name: name,
    profile_picture
  } as User;
};


const getAuthenticatorType = (authenticator: string) => {
  const db = new dbHelper();

  // Email
  if (authenticator.search("@") >= 0)
    return AuthenticatorType.email;
  // CPF
  else if (!isNaN(Number(authenticator)))
    return AuthenticatorType.cpf;
  // IDUFFS
  else
    return AuthenticatorType.idUFFS;
};

export const signIn = async ({ authenticator, password }:
  { authenticator: string; password?: string; }) => {

  const db = new dbHelper();

  const authType = getAuthenticatorType(authenticator);

  db.select("full_name, id, profile_picture")
    .from("user");

  if (authType === AuthenticatorType.email)
    db.where("email", authenticator);

  else if (authType === AuthenticatorType.cpf)
    db.where("cpf", authenticator);

  else if (authType === AuthenticatorType.idUFFS)
    db.where("idUFFS", authenticator);

  if (password !== undefined) {
    const hashedPassword = hashPassword(password);
    db.and("password", hashedPassword);
  }

  const user = await db.resolve() as { user: User }[];

  if (user[0] !== undefined) {
    const userId = user[0].user.id;
    const encryptedUserId = encryptTextHex(userId);

    if (encryptedUserId)
      user[0].user.id = encryptedUserId;

    return user[0].user;
  }

  return null;
};

export const tryUffsLogin = async ({ authenticator, password }:
  { authenticator: string, password: string }): Promise<string | null> => {
  const { tokenId } = await getTokenFromStudentPortal({ authenticator, password });
  return tokenId ? String(tokenId) : null;
};

export const getDataFromStudentPortal = async ({ authenticator, token }:
  { authenticator: string; token: string; }) => {
  const authType = getAuthenticatorType(authenticator);
  let idUFFS = "";

  if (authType === AuthenticatorType.cpf) {
    const { id } = await getIdUFFS(token);
    idUFFS = id;
  }
  else idUFFS = authenticator;

  const userData = await getUserInfo({ IdUFFS: idUFFS, token });

  return {
    idUffs: userData.username,
    email: userData.mail.length > 0 ? userData.mail[0] : null, // Get only the first one
    name: capitalizeFirstLetter(String(userData.givenname) + " " + String(userData.sn)), // nome EM CAPS
    activeStudent: String(userData.inetuserstatus), // util no futuro
    cpf: String(userData.employeeNumber) // cpf
  } as {
    idUffs: string,
    email: string,
    name: string,
    activeStudent: string,
    cpf: string
  };
};

export const getProfilePictureFromMoodle = async (authenticator: string, password: string) => {
  const userPicture = await getUserPictureFromMoodle({ authenticator, password });
  return userPicture as string;
};


export { AuthenticatorType, getAuthenticatorType };
