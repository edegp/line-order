import { getPaymentInfo } from "./../common/utils";
import * as functions from "firebase-functions";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import { f } from "../";

const getOrderInfo = async (params: any) => {
  const paymentId = params.paymentId;
  const paymentInfo = await getPaymentInfo(paymentId);
  functions.logger.info(paymentInfo);
  if (paymentInfo?.transactionId !== 0) {
    functions.logger.error(
      "[payment_id: %s] は会計済みの注文です。",
      paymentId
    );
    throw new Error();
  }
  paymentInfo;
};

export const orderInfoGet = f.https.onRequest(async (req, res) => {
  functions.logger.log(req);
  if (!req.query) {
    res.status(400).send(process.env.MSG_ERROR_NOPARAM);
  }
  const params = req.query;
  const paramChecker = tableOrderParamCheck(params as any);
  const errorMsg = paramChecker.checkApiOrderInfo();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    res.status(400).send(errorMsg.join("\n"));
  }
  let paymentInfo;
  try {
    paymentInfo = getOrderInfo(params);
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    res.status(400).send(e);
  }
  res.json(paymentInfo);
});
