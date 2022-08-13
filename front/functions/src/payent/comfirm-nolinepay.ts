import { tableOrderParamCheck } from "./../validation/tabale-order-param-check";
/* eslint-disable linebreak-style */
import {
  createSuccessResponse,
  TableOrderPaymentOrderInfo,
} from "./../common/utils";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { f } from "../";

export const confirmNolinepay = f.https.onRequest((req, res) => {
  functions.logger.info(req);
  if (!req.body) {
    res.status(400).send(process.env.MSG_ERROR_NOPARAM);
  }
  const body = JSON.parse(req.body);

  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiPaymentConfirmNolinepay();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    res.status(400).send(errorMsg.join("\n"));
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
    res.status(400).send("Error");
  }
  createSuccessResponse("");
});
