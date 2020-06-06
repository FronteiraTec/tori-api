import { db } from "../helpers/dbHelper";
import { address as AddressInterface } from "../helpers/dbNamespaceHelper";
import { InsertResponse } from 'src/helpers/dbResponsesHelper';


export const update = async (addressId: number, address: AddressInterface | Object) => {
  try {
    const result = await
      db.update("address", address)
        .where("id", String(addressId))
        .resolve();

    return result;
  } catch (err) {
    throw err;
  }
}

export const create = async (address: AddressInterface | Object) => {
  try {
    const result = await
      db.insert("address", address).resolve();

    return result.length > 0 ? result[0] as InsertResponse : undefined;
  } catch (err) {
    throw err;
  }
}

export const deleteById = async (addressId: number) => {
  try {
      const res = await db.from("address")
      .delete()
      .where("id", addressId.toString())
      .resolve();
    return res;
  } catch (err) {
    throw err;
  }
}