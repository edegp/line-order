import * as dotenv from "dotenv";
dotenv.config();
import "dotenv/config.js";
import { addDays, addWeeks, format, intervalToDuration, sub } from "date-fns";
import * as admin from "firebase-admin";
import { Items, PaymentInfo } from "../types";

export const createResponse = (statusCode: number, body: object | string) => ({
  statusCode: statusCode,
  headers: { "Access-Control-Allow-Origin": "*" },
  body: body,
});

export const createErrorResponse = (body: object | string, status = 500) =>
  createResponse(status, body);

export const createSuccessResponse = (body: object | string) =>
  createResponse(200, body);

export const separateComma = (num: number) =>
  num.toString().match(/.{3}/g)?.join(":,");

export const decimalToInt = (obj: number) => {
  if (Number.isInteger(obj)) return Math.round(obj);
  return obj;
};

export const floatToInt = (obj: number) => {
  if (Number.isInteger(obj)) return Math.round(obj);
  return obj;
};

export const formatDate = (
  date: string | number | Date,
  beforeFormat: string,
  afterFormat: string
) => {
  const beforeDate = format(new Date(date), beforeFormat);
  return format(new Date(beforeDate), afterFormat);
};

export const getTimeInterval = (
  time1: string | number | Date,
  time2: number
) => {
  const result = sub(
    new Date(time1),
    intervalToDuration({
      start: new Date(time1),
      end: new Date(time2),
    })
  );
  return result;
};

export const timedeltaToHM = (td: any) => {
  const sec = td.getSeconds();
  const hours = ((sec / 3600) | 0) * 60;
  const minutes = ((sec % 3600) / 60) | 0;
  return hours + minutes;
};

export const calculateDateStrDifference = (
  dateStr: string,
  dateDifference: number
) => {
  return format(addDays(new Date(dateStr), dateDifference), "yyyyMMdd");
};

export const getTimestampAfterOneWeek = (date: string | number | Date) => {
  const afterOneWeekDateUtc = addWeeks(new Date(date), 1);
  return Math.floor(afterOneWeekDateUtc.getTime() / 1000);
};

export const getTtlTime = (paramDatetime: string | number | Date) => {
  const deleteDay = parseInt(process.env.TTL_DAY as string | "10", 10);
  const deleteDateTime = addDays(new Date(paramDatetime), deleteDay);
  const deleteUnixtime = Math.floor(deleteDateTime.getTime() / 1000);
  return deleteUnixtime;
};

export const TableOrderPaymentOrderInfo = admin
  .firestore()
  .collection("TableOrderPaymentOrderInfo");
export const ChannelAccessToken = admin
  .firestore()
  .collection("ChannelAccessToken");
export const PaymentOrederTable = admin
  .firestore()
  .collection("PaymentOrederTable");

export const TableOrderItemList = admin
  .firestore()
  .collection("TableOrderItemList");

export const getPaymentInfo = (paymentId: string) =>
  TableOrderPaymentOrderInfo.doc(paymentId)
    .get()
    .then((doc) => doc.data()) as Promise<PaymentInfo>;

export const getCategoryItem = (categoryId: number) =>
  TableOrderItemList.doc(categoryId.toString())
    .get()
    .then((doc) => doc.data()) as Promise<Items>;
