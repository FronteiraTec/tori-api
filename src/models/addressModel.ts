import dbHelper from "../helpers/dbHelper";
import { address as AddressInterface } from "../helpers/dbNamespaceHelper";
import { InsertResponse } from "src/helpers/dbResponsesHelper";
import { decryptHexId } from "src/helpers/utilHelper";


export const update = async (addressId: number, address: AddressInterface | object) => {
  const db = new dbHelper();

  const result = await
    db.update("address", address)
      .where("id", decryptHexId(addressId))
      .resolve();

  return result;
};

export const create = async (address: AddressInterface | object) => {
  const db = new dbHelper();

  const result = await
    db.insert("address", address).resolve();

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