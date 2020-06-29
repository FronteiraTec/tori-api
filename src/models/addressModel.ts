import dbHelper from "../helpers/dbHelper";
import { address as AddressInterface } from "../helpers/dbNamespaceHelper";
import { InsertResponse } from "src/helpers/dbResponsesHelper";
import { decryptHexId, encryptTextHex } from "src/helpers/utilHelper";


export const update = async (addressId: string, address: AddressInterface | object) => {
  const db = new dbHelper();

  const result = await
    db.update("address", address)
      .where("id", decryptHexId(addressId))
      .resolve();

  return result;
};

export const updateByAssistanceId = async (assistanceId: string, address: AddressInterface | object) => {
  const db = new dbHelper();

  const result = await
    db.update("address", address)
      .where("assistance_id", decryptHexId(assistanceId))
      .resolve();

  return result;
};

export const getByAssistanceId = async (assistanceId: string) => {
  const db = new dbHelper();

  const result = await
    db.select("*")
      .from("address")
      .where("id", decryptHexId(assistanceId))
      .resolve() as AddressInterface[];

    const address = {
      ...result[0],
      assistance_id: assistanceId,
      id: encryptTextHex(result[0].id)
    };

  return address;
};

export const create = async (address: AddressInterface | any) => {
  const db = new dbHelper();

  const result = await
    db.insert("address", {
      ...address,
      assistance_id: decryptHexId(address.assistance_id)
    }).resolve();

  return result.length > 0 ? result[0] as InsertResponse : undefined;
};

export const deleteById = async (addressId: number) => {
  const db = new dbHelper();

  const res = await db.from("address")
    .delete()
    .where("id", decryptHexId(addressId))
    .resolve();
  return res;
};