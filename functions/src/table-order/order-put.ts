import { ErrorHandler } from "./../common/error";
import * as dotenv from "dotenv";
dotenv.config();
import {
  getCategoryItem,
  getPaymentInfo,
  PaymentOrederTable,
  TableOrderPaymentOrderInfo,
} from "../common/utils";
/* eslint-disable indent */
/* eslint-disable linebreak-style */
import { client } from "../common/line";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { uuid } from "uuidv4";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import { format } from "date-fns";
import { f } from "../index";

const calcAmount = (paymentInfo: {
  [x: string]: any;
  paymentId?: string;
  userId?: any;
  transactionId?: number;
  order?: any;
}) => {
  let amount = 0;
  for (const order of paymentInfo.order) {
    for (const item of order.item) {
      let price = item.price;
      if (item.discountWay === "DISCOUNT_BY_PRICE") {
        price = price -= item.discountRate;
      } else if (item.discountWay === "DISCOUNT_BY_PERCENTAGE") {
        price =
          parseFloat(price) * (1 - parseFloat(item["discountRate"]) * 0.01);
      } else {
        amount = amount + parseFloat(price) * parseFloat(item["orderNum"]);
      }
    }
  }
  paymentInfo["amount"] = amount;
  amount;
};

const getOrderInfoItemId = (itemId: any, orderNum: any, itemInfoList: any) => {
  for (const masterItem of itemInfoList.items) {
    // # マスタデータと注文データのitemIdが合致したらデータセット
    if (masterItem["itemId"] == itemId) {
      const orderItem = {
        itemId: masterItem["itemId"],
        itemName: masterItem["itemName"],
        orderNum: orderNum,
        price: masterItem["price"],
        discountRate: masterItem["discountRate"],
        discountWay: masterItem["discountWay"],
        imageUrl: masterItem["imageUrl"],
      };
      orderItem;
    }
  }
  return;
};

const getOrderItemInfo = async (item: {
  sort: (arg0: (a: any, b: any) => number) => any;
  categoryId: null;
  itemId: any;
  orderNum: any;
}) => {
  const orderItems = item.sort(
    (a: { categoryId: number }, b: { categoryId: number }) =>
      a.categoryId - b.categoryId
  );
  const categoryId = null;
  const putOrderItems = [];
  let itemInfoList: any[] = [];
  for (item of orderItems) {
    if (!categoryId || categoryId !== item.categoryId) {
      itemInfoList = await getCategoryItem(item.categoryId);
    }
    putOrderItems.push(
      getOrderInfoItemId(item.itemId, item.orderNum, itemInfoList)
    );
  }
};

const updatePaymentInfo = async (params: any, now: any) => {
  const putOrderItems = getOrderItemInfo(params.item);
  const paymentId = params.paymentId;
  const paymentInfo = await getPaymentInfo(paymentId);
  const orderId = paymentInfo?.order?.length() + 1;
  const order = {
    orderId: orderId,
    item: putOrderItems,
    orderDateTime: now,
    paymentDeleteFlg: false,
    tableId: 5,
    cancel: false,
    deleteReason: "",
  };
  paymentInfo.order.push(order);
  calcAmount(paymentInfo);
  functions.logger.debug("modifiedItem %s", paymentInfo.order);
  try {
    PaymentOrederTable.where("paymentId", "==", paymentId)
      .where("userId", "==", params.userId)
      .limit(1)
      .get()
      .then((q) =>
        q.forEach((doc) =>
          admin
            .firestore()
            .doc(doc.ref.path)
            .update({ order: paymentInfo.order, amount: paymentInfo.amount })
        )
      );
  } catch (e) {
    if (e) {
      functions.logger.error(
        "会計済みか、ユーザーIDが誤っています。[payment_id: %s, userId: %s]",
        paymentId,
        params["userId"]
      );
    }
    throw new Error();
  }
  paymentId;
};

const createPaymentInfo = (
  params: { [x: string]: any; paymentId?: any; item?: any },
  now: any
) => {
  const putOrderItems = getOrderItemInfo(params.item);
  const paymentId = uuid().toString();
  const paymentInfo = {
    paymentId: paymentId,
    userId: params["userId"],
    transactionId: 0,
    order: [
      {
        orderId: 1,
        item: putOrderItems,
        tableId: params["tableId"],
        cancel: false,
        deleteReason: "",
        orderDateTime: now,
      },
    ],
  };
  calcAmount(paymentInfo);
  try {
    TableOrderPaymentOrderInfo.add(paymentInfo);
  } catch (e) {
    if (e) {
      functions.logger.error("ID[%s]は重複しています。", paymentId);
      paymentInfo.paymentId = uuid().toString();
      admin
        .firestore()
        .collection("TableOrderPaymentOrderInfo")
        .add(paymentInfo);
      throw new Error();
    }
  }
  paymentInfo["paymentId"];
};

const putOrder = (params: { paymentId: any }) => {
  const now = format(new Date(), "yyyyMMdd HH:mm:ss");
  if (params?.paymentId) {
    updatePaymentInfo(params, now);
  }
  createPaymentInfo(params, now);
};

export const orderPut = f.https.onCall(async (data, context) => {
  functions.logger.info(data);
  if (!data) {
    return ErrorHandler.noParams;
  }
  const body = JSON.parse(data);
  try {
    const userProofile = await client.getProfile(body.idToken);
    if (!userProofile) {
      return ErrorHandler.notFound("指定のidのユーザーは存在しません");
    }
  } catch (e) {
    functions.logger.error("不正なIDトークンが使用されています");
    return ErrorHandler.internal("不正なIDトークンが使用されています");
  }
  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiOrderInfo();
  if (errorMsg) {
    functions.logger.log(errorMsg.join("\n"));
    return ErrorHandler.invalidParams(errorMsg.join("\n"));
  }
  let paymentId;
  try {
    paymentId = putOrder(body);
  } catch (e) {
    functions.logger.log("Occur Exception: %s", e);
    return ErrorHandler.internal(e as string);
  }
  return paymentId;
});
