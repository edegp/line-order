import { ErrorHandler } from "./../common/error";
import { TableOrderPaymentOrderInfo } from "../common/utils";
import { client } from "../common/line";
const functions = require("firebase-functions");
import { f } from "..";

const getPaymentId = async (userId: string) => {
  const paymentInfo = await TableOrderPaymentOrderInfo.where(
    "userId",
    "==",
    userId
  )
    .where("transaction_id", "==", 0)
    .get()
    .then((q) => q.docs.map((doc) => doc.data()));
  for (const paymentData of paymentInfo) {
    return paymentData["paymentId"];
  }
  return "";
};

export const idGet = f.https.onCall(async (data: any, context: any) => {
  functions.logger.info(data);
  if (!data) {
    throw ErrorHandler.noParams;
  }
  const params: any = data;
  try {
    const userProfile = await client.getProfile(params["idToken"]);
    if (!userProfile) {
      throw ErrorHandler.notFound("不適切なid設定です");
    } else {
      params["userId"] = userProfile.userId;
    }
  } catch (e) {
    functions.logger.error("不正なIDトークンが使用されています");
    throw ErrorHandler.permision("不正なIDトークンが使用されています");
  }
  let paymentId;
  try {
    paymentId = await getPaymentId(params["userId"]);
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    throw ErrorHandler.internal;
  }
  return paymentId;
});
