import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

export const f = functions.region("asia-northeast1");

const funcs = {
  idGet: "./payent/id-get",
  confirmNolinepay: "./payent/comfirm-nolinepay",
  confirm: "./payent/comfirm",
  categoryGet: "./order-item/category-get",
  orderInfoGet: "./order-item/order-info-get",
  orderPut: "./order-item/order-put",
  ItemListGet: "./order-item/item-list-get",
  reserve: "./order-item/reserve",
};
const loadFunctions = (filesObj: any) => {
  for (const key in filesObj) {
    if (
      !process.env.FUNCTION_NAME ||
      process.env.FUNCTION_NAME.startsWith(key)
    ) {
      module.exports[key] = require(filesObj[key]);
    }
  }
};

loadFunctions(funcs);
