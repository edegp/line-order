import { ErrorHandler } from "./../common/error";
import { pay, client } from "../common/line";
import { FLEX_COUPON } from "../common/common-const";
import {
  TableOrderPaymentOrderInfo,
  ChannelAccessToken,
  getPaymentInfo,
} from "../common/utils";
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

export const confirm = f.https.onCall(async (data, context) => {
  functions.logger.info(data);
  if (!data) {
    return ErrorHandler.noParams;
  }
  let body = JSON.parse(data);
  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiPaymentConfirm();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    return ErrorHandler.invalidParams(errorMsg.join("\n"));
  }
  const paymentId = body["paymentId"];
  let transactionId = parseInt(body["transactionId"], 10);
  try {
    const paymentInfo = await getPaymentInfo(paymentId);
    const amount = paymentInfo["amount"];
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
      if (!process.env.LINE_PAY_CHANNEL_ID) {
        functions.logger.error("process.env.LINE_PAY_CHANNEL_ID is undefined");
      }
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
      return ErrorHandler.internal;
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
    return ErrorHandler.internal;
  }
  return body;
});
