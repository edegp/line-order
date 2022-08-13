import { pay, client } from "./../common/line";
import { FLEX_COUPON } from "./../common/common-const";
import {
  TableOrderPaymentOrderInfo,
  ChannelAccessToken,
  getPaymentInfo,
} from "./../common/utils";
import * as functions from "firebase-functions";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import { f } from "..";

const CHANNEL_ID = process.env.LINE_CHANNEL_ID;
if (!CHANNEL_ID) {
  functions.logger.error("Specify CHANNEL_ID as environment variable.");
}

const sendMessages = async (body: { [x: string]: any }) => {
  const flexObj = FLEX_COUPON;
  const channelAccessToken = await ChannelAccessToken.where(
    "channelId",
    "==",
    CHANNEL_ID
  )
    .limit(1)
    .get()
    .then((q) => q.docs[0].data());
  if (!channelAccessToken) {
    functions.logger.error(
      "CHANNEL_ACCESS_TOKEN in Specified CHANNEL_ID: %s is not exist.",
      CHANNEL_ID
    );
  } else {
    client.replyMessage(
      channelAccessToken["channelAccessToken"],
      flexObj,
      body["userId"]
    );
  }
};

export const confirm = f.https.onRequest(async (req, res) => {
  functions.logger.info(req);
  if (!req.body) {
    res.status(400).send("パラメータ未設定エラー");
  }
  let body = JSON.parse(req.body);
  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiPaymentConfirm();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    res.status(400).send(errorMsg.join("\n"));
  }
  const paymentId = body["paymentId"];
  let transactionId = parseInt(body["transactionId"], 10);
  try {
    const paymentInfo = await getPaymentInfo(paymentId);
    const amount = parseFloat(paymentInfo["amount"]);
    const currency = "JPY";
    await TableOrderPaymentOrderInfo.where("paymentId", "==", paymentId)
      .limit(1)
      .get()
      .then((q) =>
        TableOrderPaymentOrderInfo.doc(q.docs[0].ref.path).update({
          transactionId,
        })
      );

    try {
      const linepayApiResponse = pay.confirmPayment({
        amount,
        currency,
        transactionId: transactionId.toString(),
      });
      body = JSON.stringify(linepayApiResponse);
    } catch (e) {
      functions.logger.error("Occur Exception: %s", e);
      transactionId = 0;
      await TableOrderPaymentOrderInfo.where("paymentId", "==", paymentId)
        .limit(1)
        .get()
        .then((q) =>
          TableOrderPaymentOrderInfo.doc(q.docs[0].ref.path).update({
            transactionId,
          })
        );
      res.status(400).send("Error");
    }
    sendMessages(paymentInfo);
  } catch (e) {
    if (transactionId == 0) {
      functions.logger.error(
        // eslint-disable-next-line linebreak-style
        "payment_id: %s could not update, please update transaction_id = 0 manually and confirm the payment",
        paymentId
      );
    } else {
      functions.logger.error("Occur Exception: %s", e);
    }
    res.status(400).send("internal server error");
  }
  res.status(200).json(body);
});
