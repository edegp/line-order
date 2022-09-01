import { Items, PaymentInfo } from "../types/index";
import { ErrorHandler } from "./../common/error";
import * as dotenv from "dotenv";
dotenv.config();
import {
  getCategoryItem,
  getPaymentInfo,
  TableOrderPaymentOrderInfo,
} from "../common/utils";
import line from "../common/line";
import { v4 as uuidv4 } from "uuid";
import { tableOrderParamCheck } from "../validation/tabale-order-param-check";
import { format } from "date-fns";
import { f } from "../index";

const functions = require("firebase-functions");

const calcAmount = (paymentInfo: PaymentInfo) => {
  let amount = 0;
  for (const order of paymentInfo.order) {
    if (typeof order.item === "object") {
      for (const item of order.item) {
        let price = item.price;
        if (item.discountWay === 1) {
          price = price -= item.discountRate;
        } else if (item.discountWay === 2) {
          price =
            parseFloat(price.toString()) *
            (1 - parseFloat(item["discountRate"].toString()) * 0.01);
        }
        amount =
          amount +
          parseFloat(price.toString()) *
            parseFloat(item["orderNum"].toString());
      }
    }
  }
  paymentInfo["amount"] = parseFloat(amount.toString());
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
      // functions.logger.debug("itemInfoList", itemInfoList);
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
  try {
    TableOrderPaymentOrderInfo.doc(paymentId).update({
      order: paymentInfo.order,
      amount: paymentInfo.amount,
    });
  } catch (e: any) {
    if (e) {
      functions.logger.error("会計済みか、ユーザーIDが誤っています。", e);
    }
    throw new Error();
  }
  return paymentId;
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
  now: string
) => {
  let putOrderItems = await getOrderItemInfo(params.item);
  const paymentId = uuidv4().toString();
  functions.logger.info("params", params);
  // functions.logger.debug("putOrderItems", putOrderItems);
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
    const docRef = TableOrderPaymentOrderInfo.doc(paymentId);
    await docRef.set(paymentInfo);
  } catch (e) {
    if (e) {
      functions.logger.error("ID[%s]は重複しています。", paymentId);
      paymentInfo.paymentId = uuidv4().toString();
      TableOrderPaymentOrderInfo.doc(paymentId);
      throw new Error(e.toString());
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
  const now = format(new Date(), "yyyy/MM/dd HH:mm:ss");
  if (params?.paymentId) {
    return updatePaymentInfo(params, now);
  }
  return createPaymentInfo(params, now);
};

export const orderPut = f.https.onCall(async (data: any, context: any) => {
  functions.logger.info(data);
  if (!data) {
    return ErrorHandler.noParams;
  }
  const body = JSON.parse(JSON.stringify(data));
  try {
    const userProofile = await line.getProfile(
      body.idToken,
      process.env.LIFF_CHANNEL_ID as string
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
  } catch (e: any) {
    functions.logger.error("Occur Exception: %s", e);
    // return ErrorHandler.internal(e as string);
  }
  return paymentId;
});
