import { ErrorHandler } from "./../common/error";
import { getPaymentInfo } from "../common/utils";
const functions = require("firebase-functions");
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import { f } from "..";

const getOrderInfo = async (params: any) => {
  const paymentId = params.paymentId;
  const paymentInfo = await getPaymentInfo(paymentId);
  functions.logger.info(paymentInfo);
  if (paymentInfo?.transactionId !== 0) {
    functions.logger.error(
      "[payment_id: %s] は会計済みの注文です。",
      paymentId
    );
    throw new Error("[payment_id: %s] は会計済みの注文です。");
  }
  return paymentInfo;
};

export const orderInfoGet = f.https.onCall(async (data: any, context: any) => {
  functions.logger.log(data);
  if (!data) {
    throw ErrorHandler.noParams;
  }
  const params = data;
  const paramChecker = tableOrderParamCheck(params as any);
  const errorMsg = paramChecker.checkApiOrderInfo();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    throw ErrorHandler.invalidParams(errorMsg.join("\n"));
  }
  let paymentInfo;
  try {
    paymentInfo = await getOrderInfo(params);
  } catch (error) {
    functions.logger.error("Occur Exception: %s", error);
        if (error instanceof Error) {
          throw ErrorHandler.internal(error.message);
        } else if (typeof error === "string") {
          throw ErrorHandler.internal(error);
        } else {
          throw ErrorHandler.internal("unexpected error");
        }
    
  }
  return paymentInfo;
});
