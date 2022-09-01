import { ErrorHandler } from "./../common/error";
import * as dotenv from "dotenv";
dotenv.config();
import { getPaymentInfo } from "../common/utils";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import line, { pay } from "../common/line";
const functions = require("firebase-functions");
import { f } from "..";
import { LinepayApiResponse } from "../types";

const CONFIRM_URL = process.env.CONFIRM_URL;
const CANCEL_URL = process.env.CANCEL_URL;

export const reserve = f.https.onCall(async (data: any, context: any) => {
  functions.logger.info(data);
  if (!data) {
    return ErrorHandler.noParams;
  }
  let body = JSON.parse(JSON.stringify(data));

  try {
    const userProfile = await line.getProfile(
      body["idToken"],
      process.env.LIFF_CHANNEL_ID as string
    );
    if (!userProfile) {
      return ErrorHandler.invalidParams("不適切なidトークンです");
    } else {
      body["userId"] = userProfile.userId;
    }
  } catch (e) {
    functions.logger.error("不正なIDトークンが使用されています");
    return ErrorHandler.permision("不正なIDトークンが使用されています");
  }
  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiPaymentReserve();
  if (errorMsg.length !== 0) {
    functions.logger.log(errorMsg.join("\n"));
    return ErrorHandler.invalidParams(errorMsg.join("\n"));
  }
  const paymentId = body["paymentId"];
  const paymentInfo = await getPaymentInfo(paymentId);
  const amount = paymentInfo.amount;
  body = {
    amount: amount,
    currency: "JPY",
    orderId: paymentId,
    packages: [
      {
        id: "1",
        amount: amount,
        name: "LINE Use Case Barger",
        products: [
          {
            name: "オーダー商品",
            imageUrl:
              "https://media.istockphoto.com/vectors/cash-register-with-a-paper-check-flat-isolated-vector-id1018485968",
            quantity: "1",
            price: amount,
          },
        ],
      },
    ],
    redirectUrls: {
      confirmUrl: CONFIRM_URL,
      cancelUrl: CANCEL_URL,
    },
    options: {
      payment: {
        capture: "True",
      },
    },
  };

  try {
    const linepayApiResponse: LinepayApiResponse = await pay.request(body);
    functions.logger.debug("success %s", linepayApiResponse);
    body = linepayApiResponse;
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    return ErrorHandler.internal;
  }
  return JSON.parse(JSON.stringify(body));
});
