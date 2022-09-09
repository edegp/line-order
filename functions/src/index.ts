import * as dotenv from "dotenv";
dotenv.config();
import "dotenv/config.js";
import * as admin from "firebase-admin";
const functions = require("firebase-functions");

admin.initializeApp();

export const f = !process.env.FUNCTIONS_EMULATOR
  ? functions.region("asia-northeast1")
  : functions;

const funcs = {
  idGet: "./payment/id-get",
  // confirmNolinepay: "./payment/comfirm-nolinepay",
  confirm: "./payment/comfirm",
  reserve: "./payment/reserve",
  // categoryGet: "./table-order/category-get",
  // orderInfoGet: "./table-order/order-info-get",
  orderPut: "./table-order/order-put",
  // itemListGet: "./table-order/item-list-get",
  updateLineAccessToken: "./update-line-access-token",
};

const loadFunctions = (funcs: any) => {
  for (const key in funcs) {
    if (
      !process.env.FUNCTION_NAME ||
      process.env.FUNCTION_NAME.startsWith(key)
    ) {
      module.exports[key] = require(funcs[key])[key];
    }
  }
};

loadFunctions(funcs);
