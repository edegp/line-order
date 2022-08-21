import * as dotenv from "dotenv";
dotenv.config();
import "dotenv/config.js";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
// import { idGet } from "./payment/id-get";
// import { confirmNolinepay } from "./payment/confir-nolinepay";
// import { confirm } from "./payment/confirm";
// import { reserve } from "./payment/reserve";
// import {categoryGet} from "./table-order/category-get";
// import {orderPut} from "./table-order/order-put";
// import {orderInfoGet} from "./table-order/order-info-get";
// import { ItemListGet } from "./table-order/item-list-get";
// import { }

admin.initializeApp();

export const f = !process.env.FUNCTIONS_EMULATOR
  ? functions.region("asia-northeast1")
  : functions;

const funcs = {
  idGet: "./payment/id-get",
  confirmNolinepay: "./payment/comfirm-nolinepay",
  confirm: "./payment/comfirm",
  reserve: "./payment/reserve",
  categoryGet: "./table-order/category-get",
  orderInfoGet: "./table-order/order-info-get",
  orderPut: "./table-order/order-put",
  itemListGet: "./table-order/item-list-get",
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
