import { Items, PaymentInfo } from "../types/index";
import { ErrorHandler } from "./../common/error";
import * as dotenv from "dotenv";
dotenv.config();
import {
  getCategoryItem,
  getPaymentInfo,
  PaymentOrederTable,
  TableOrderPaymentOrderInfo,
} from "../common/utils";
import line from "../common/line";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { v4 as uuidv4 } from "uuid";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import { format } from "date-fns";
import { f } from "../index";

const calcAmount = (paymentInfo: PaymentInfo) => {
  let amount = 0;
  functions.logger.debug("amout paymentInfo", paymentInfo);
  for (const order of paymentInfo.order) {
    functions.logger.debug("amout order", order);
    if (typeof order.item === "object") {
      functions.logger.debug("amout order.item", order.item);
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
  }
  paymentInfo["amount"] = amount;
};

const getOrderInfoItemId = (
  itemId: number,
  orderNum: number,
  itemInfoList: Items
) => {
  let orderItem = {} as {
    itemId: number;
    itemName: string;
    orderNum: number;
    price: number;
    discountRate: number;
    discountWay: number;
    imageUrl: string;
  };
  for (const masterItem of itemInfoList.items) {
    // # マスタデータと注文データのitemIdが合致したらデータセット
    if (masterItem["itemId"] == itemId) {
      orderItem = {
        itemId: masterItem["itemId"],
        itemName: masterItem["itemName"],
        orderNum: orderNum,
        price: masterItem["price"],
        discountRate: masterItem["discountRate"],
        discountWay: masterItem["discountWay"],
        imageUrl: masterItem["imageUrl"],
      };
      return orderItem;
    }
  }
  return orderItem;
};

const getOrderItemInfo = async (
  items: {
    categoryId: number;
    itemId: number;
    orderNum: number;
  }[]
) => {
  const orderItems = items.sort((a, b) => a["categoryId"] - b["categoryId"]);
  let categoryId = null;
  let putOrderItems = [] as {
    itemId: number;
    itemName: string;
    orderNum: number;
    price: number;
    discountRate: number;
    discountWay: number;
    imageUrl: string;
  }[];
  let itemInfoList = {} as Items;
  for (let item of orderItems) {
    if (!categoryId || categoryId !== item["categoryId"]) {
      categoryId = item["categoryId"];
      itemInfoList = await getCategoryItem(item["categoryId"]);
      functions.logger.debug("itemInfoList", itemInfoList);
    }
    putOrderItems.push(
      getOrderInfoItemId(item["itemId"], item["orderNum"], itemInfoList)
    );
  }
  return putOrderItems;
};

const updatePaymentInfo = async (params: any, now: any) => {
  const putOrderItems = await getOrderItemInfo(params.item);
  const paymentId = params.paymentId;
  const paymentInfo = await getPaymentInfo(paymentId);
  functions.logger.debug("paymentInfo", paymentInfo);
  const orderId = paymentInfo?.order?.length + 1;
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

const createPaymentInfo = async (
  params: {
    userId: string;
    paymentId?: string;
    token: string;
    tableId: number;
    item: {
      categoryId: number;
      itemId: number;
      orderNum: number;
    }[];
  },
  now: any
) => {
  let putOrderItems = await getOrderItemInfo(params.item);
  const paymentId = uuidv4().toString();
  functions.logger.info("params", params);
  functions.logger.debug("putOrderItems", putOrderItems);
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
      paymentInfo.paymentId = uuidv4().toString();
      admin
        .firestore()
        .collection("TableOrderPaymentOrderInfo")
        .add(paymentInfo);
      throw new Error();
    }
  }
  return paymentInfo["paymentId"];
};

const putOrder = (params: {
  userId: string;
  paymentId?: string;
  token: string;
  tableId: number;
  item: {
    categoryId: number;
    itemId: number;
    orderNum: number;
  }[];
}) => {
  const now = format(new Date(), "yyyyMMdd HH:mm:ss");
  if (params?.paymentId) {
    return updatePaymentInfo(params, now);
  }
  return createPaymentInfo(params, now);
};

export const orderPut = f.https.onCall(async (data, context) => {
  functions.logger.info(data);
  if (!data) {
    return ErrorHandler.noParams;
  }
  const body = JSON.parse(JSON.stringify(data));
  try {
    const userProofile = await line.getProfile(
      body.idToken,
      process.env.LIFF_CHANNEL_ID
    );
    if (!userProofile) {
      return ErrorHandler.notFound("指定のidのユーザーは存在しません");
    }
  } catch (e) {
    functions.logger.error(e);
    return ErrorHandler.internal("不正なIDトークンが使用されています");
  }
  const paramChecker = tableOrderParamCheck(body);
  const errorMsg = paramChecker.checkApiOrderPut();
  if (errorMsg.length !== 0) {
    functions.logger.error(errorMsg.join("\n"));
    return ErrorHandler.invalidParams(errorMsg.join("\n"));
  }
  let paymentId;
  try {
    paymentId = putOrder(body);
  } catch (e) {
    functions.logger.error("Occur Exception: %s", e);
    return ErrorHandler.internal(e as string);
  }
  return paymentId;
});
