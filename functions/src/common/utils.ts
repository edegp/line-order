/* eslint-disable indent */
/* eslint-disable linebreak-style */
import { addDays, addWeeks, format, intervalToDuration, sub } from "date-fns";

export const createResponse = (statusCode: number, body: object) => ({
  statusCode: statusCode,
  headers: { "Access-Control-Allow-Origin": "*" },
  body: body,
});

export const createErrorResponse = (body: object, status = 500) =>
  createResponse(status, body);

export const createSuccessResponse = (body: object) =>
  createResponse(200, body);

export const separateComma = (num: number) =>
  num.toString().match(/.{3}/g)?.join(":,");

export const decimalToInt = (obj: number) => {
  if (Number.isInteger(obj)) return Math.round(obj);
};

export const floatToInt = (obj: number) => {
  if (Number.isInteger(obj)) return Math.round(obj);
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
  const deleteDay = parseInt(process.env.TTL_DAY, 10);
  const deleteDateTime = addDays(new Date(paramDatetime), deleteDay);
  const deleteUnixtime = Math.floor(deleteDateTime.getTime() / 1000);
  return deleteUnixtime;
};
