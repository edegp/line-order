import { ErrorHandler } from "./../common/error";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import {
  createSuccessResponse,
  TableOrderPaymentOrderInfo,
} from "../common/utils";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { f } from "..";

export const confirmNolinepay = f.https.onCall((data, context) => {
  functions.logger.info(data);
  if (!data) {
    return ErrorHandler.noParams;
  }
  const body = JSON.parse(data);

  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiPaymentConfirmNolinepay();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    return ErrorHandler.invalidParams(errorMsg.join("\n"));
  }
  const paymentId = body["paymentId"];
  const transactioId = 99999999999999;

  try {
    TableOrderPaymentOrderInfo.where("paymentId", "==", paymentId)
      .limit(1)
      .get()
      .then((q) =>
        admin.firestore().doc(q.docs[0].ref.path).update({ transactioId })
      );
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    return ErrorHandler.internal;
  }
  createSuccessResponse("");
});
