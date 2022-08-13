import { TableOrderPaymentOrderInfo } from "./../common/utils";
import { client } from "./../common/line";
import * as functions from "firebase-functions";
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

export const idGet = f.https.onRequest(async (req, res) => {
  functions.logger.info(req);
  if (!req.query) {
    res.status(400).send("パラメータ設定エラー");
  }
  const params: any = req.query;
  try {
    const userProfile = await client.getProfile(params["idToken"]);
    if (!userProfile) {
      res.status(402).send("不適切なidトークンです");
    } else {
      params["userId"] = userProfile.userId;
    }
  } catch (e) {
    functions.logger.error("不正なIDトークンが使用されています");
    res.status(400).send("不正なIDトークンが使用されています");
  }
  let paymentId;
  try {
    paymentId = await getPaymentId(params["userId"]);
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    res.status(400).send("internal server error");
  }
  res.json({ paymentId });
});
