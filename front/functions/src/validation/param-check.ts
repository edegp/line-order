/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";

export const checkRequired = (columns: number, columnName: string) => {
  const columnsReplaced = columns.toString().replace(" ", "");
  if (!columnsReplaced || !columns) return "必須入力エラー" + columnName;
};
export const checkLength = (
  columns: number | string,
  columnName: string,
  min: number,
  max: number
) => {
  if (typeof columns === "number") columns = columns.toString();
  if (min && min > columns.length) {
    return `文字数エラー（最小文字数[${min}]未満）:${columnName}`;
  }
  if (max && max > columns.length) {
    return `文字数エラー（最小文字数[${max}]超過）:${columnName}`;
  }
};
export const checkInt = (columns: string, columnName: string) => {
  let columnsReplaced;
  if (typeof columns === "number") columnsReplaced = true;
  else columnsReplaced = parseInt(columns, 10);
  if (!columns || !columnsReplaced) return "int型チェックエラー:" + columnName;
};
export const checkYearMonth = (columns: string, columnName: any) => {
  const columnsReplaced = columns.replace("-", "").replace("/", "");
  try {
    format(new Date(columnsReplaced), "yyyyMM");
  } catch {
    return `年月形式エラー : ${columnName}(${columns})`;
  }
};
export const checkYearMonthDay = (columns: string, columnName: any) => {
  const columnsReplaced = columns.replace("-", "").replace("/", "");
  try {
    format(new Date(columnsReplaced), "yyyyMMdd");
  } catch {
    return `年月日形式エラー : ${columnName}(${columns})`;
  }
};
export const checkTimeFormat = (
  columns: string,
  columnName: any,
  timeFormat: any
) => {
  const columnsReplaced = columns.replace("-", "").replace("/", "");
  try {
    format(new Date(columnsReplaced), timeFormat.toString());
  } catch {
    return `年月日形式エラー : ${columnName}(${columns})`;
  }
};
