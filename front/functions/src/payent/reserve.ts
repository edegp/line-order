import { getPaymentInfo } from "./../common/utils";
import { tableOrderParamCheck } from "./../validation/tabale-order-param-check";
import { client, pay } from "./../common/line";
import * as functions from "firebase-functions";
import { f } from "..";

const CONFIRM_URL = process.env.CONFIRM_URL;
const CANCEL_URL = process.env.CANCEL_URL;
// const LOGGER_LEVEL = process.env.LOGGER_LEVEL;
// const LIFF_CHANNEL_ID = process.env.LIFF_CHANNEL_ID;

export const reserve = f.https.onRequest(async (req, res) => {
  functions.logger.info(req);
  if (!req.body) {
    res.status(400).send(process.env.MSG_ERROR_NOPARAM);
  }
  let body = JSON.parse(req.body);

  try {
    const userProfile = await client.getProfile(body["idToken"]);
    if (!userProfile) {
      res.status(402).send("不適切なidトークンです");
    } else {
      body["userId"] = userProfile.userId;
    }
  } catch (e) {
    functions.logger.error("不正なIDトークンが使用されています");
    res.status(400).send("不正なIDトークンが使用されています");
  }
  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiPaymentReserve();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    res.status(400).send(errorMsg.join("\n"));
  }
  const paymentId = body["paymentId"];
  const paymentInfo = await getPaymentInfo(paymentId);
  const amount = parseInt(paymentInfo.amount, 10);
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
    const linepayApiResponse = await pay.reservePayment(body);
    body = JSON.stringify(linepayApiResponse);
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    res.status(400).send("error");
  } finally {
    res.status(200).send(body);
  }
});
