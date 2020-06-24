import { db } from "../helpers/dbHelper";
import { user as User } from "../helpers/dbNamespaceHelper";

import {
  getTokenFromStudentPortal,
  getIdUFFS,
  getUserInfo,
  getUserPictureFromMoodle
} from 'src/helpers/loginUffsHelper';
import { encryptTextHex, capitalizeFirstLetter, hashPassword } from 'src/helpers/utilHelper';


enum AuthenticatorType {
  email,
  idUFFS,
  cpf
}

export const signUp = async ({ name, cpf, authenticator, password, idUffs, profilePicture }:
  { name: string; cpf: string; authenticator: string; password: string; profilePicture?: string; idUffs?: string }) => {

  const hashedPassword = hashPassword(password);

  console.log(idUffs);

  const newUserData = {
    cpf: cpf,
    email: authenticator,
    password: hashedPassword,
    full_name: name,
  } as User

  if (idUffs)
    newUserData.idUFFS = idUffs;
  if (profilePicture)
    newUserData.profile_picture = profilePicture;

  try {
    const newUser = await db.insert("user", newUserData)
      .resolve() as { insertId: string }[];

    return {
      id: encryptTextHex(newUser[0].insertId),
      full_name: name
    } as User;
  } catch (err) {
    throw err;
  }
}


const getAuthenticatorType = (authenticator: string) => {

  //Email
  if (authenticator.search("@") >= 0)
    return AuthenticatorType.email
  //CPF
  else if (!isNaN(Number(authenticator)))
    return AuthenticatorType.cpf;
  //IDUFFS
  else
    return AuthenticatorType.idUFFS;
}

export const signIn = async ({ authenticator, password }:
  { authenticator: string; password?: string; }) => {

  const authType = getAuthenticatorType(authenticator);

  try {
    db.select("full_name, id")
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

    if (user[0] !== undefined){
      const userId = user[0].user.id;
      const encryptedUserId = encryptTextHex(userId);

      if(encryptedUserId)
        user[0].user.id = encryptedUserId;
        
      return user[0].user;
    }

    return null;

  } catch (err) {
    throw err;
  }
}

export const tryUffsLogin = async ({ authenticator, password }:
  { authenticator: string, password: string }): Promise<string | null> => {
  try {
    const { tokenId } = await getTokenFromStudentPortal({ authenticator, password });
    return tokenId ? String(tokenId) : null;
  } catch (err) {
    throw err;
  }
}

export const getDataFromStudentPortal = async ({ authenticator, token }:
  { authenticator: string; token: string; }) => {
  const authType = getAuthenticatorType(authenticator);
  let idUFFS = "";

  if (authType === AuthenticatorType.cpf) {
    const { id } = await getIdUFFS(token);
    idUFFS = id;
  }
  else idUFFS = authenticator;

  try {
    const userData = await getUserInfo({ IdUFFS: idUFFS, token });

    return {
      idUffs: userData.username,
      email: userData.mail.length > 0 ? userData.mail[0] : null, //Get only the first one
      name: capitalizeFirstLetter(String(userData.givenname) + " " + String(userData.sn)), // nome EM CAPS
      activeStudent: String(userData.inetuserstatus), // util no futuro
      cpf: String(userData.employeeNumber) //cpf
    } as {
      idUffs: string,
      email: string,
      name: string,
      activeStudent: string,
      cpf: string
    };
  } catch (err) {
    throw err;
  }
}

export const getProfilePictureFromMoodle = async (authenticator: string, password: string) => {
  try {

    const userPicture = await getUserPictureFromMoodle({ authenticator, password });
    return userPicture as string;
  } catch (err) {
    throw err;
  }
}


export { AuthenticatorType, getAuthenticatorType };
