import { db } from "../helpers/dbHelper";
import { address as AddressInterface } from "../helpers/dbNamespace";


export const update = async (addressId: number, address: AddressInterface | Object) => {

  try {
    const result = await
      db.update("address", address)
        .where("address_id", String(addressId))
        .resolve();

    return result;
  } catch (err) {
    throw err;
  }
}




function defaultReturn() {
  return `
    user_id,
    user_full_name,
    user_created_at,
    user_email
  `;
}