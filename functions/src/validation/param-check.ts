import { format } from "date-fns";

export const checkRequired = (columns: number, column_name: string) => {
  const columnsReplaced = columns.toString().replace(" ", "");
  if (!columnsReplaced || !columns) return "必須入力エラー" + column_name;
};
export const checkLength = (
  columns: number | string,
  column_name: string,
  min: number,
  max: number
) => {
  if (typeof columns === "number") columns = columns.toString();
  if (min && min > columns.length)
    return `文字数エラー（最小文字数[${min}]未満）:${column_name}`;
  if (max && max > columns.length)
    return `文字数エラー（最小文字数[${max}]超過）:${column_name}`;
};
export const checkInt = (columns: string, column_name: string) => {
  let columnsReplaced;
  if (typeof columns === "number") columnsReplaced = true;
  else columnsReplaced = parseInt(columns, 10);
  if (!columns || !columnsReplaced) return "int型チェックエラー:" + column_name;
};
export const checkYearMonth = (columns: string, column_name: any) => {
  const columnsReplaced = columns.replace("-", "").replace("/", "");
  try {
    format(new Date(columnsReplaced), "yyyyMM");
  } catch {
    return `年月形式エラー : ${column_name}(${columns})`;
  }
};
export const checkYearMonthDay = (columns: string, column_name: any) => {
  const columnsReplaced = columns.replace("-", "").replace("/", "");
  try {
    format(new Date(columnsReplaced), "yyyyMMdd");
  } catch {
    return `年月日形式エラー : ${column_name}(${columns})`;
  }
};
export const checkTimeFormat = (
  columns: string,
  column_name: any,
  time_format: any
) => {
  const columnsReplaced = columns.replace("-", "").replace("/", "");
  try {
    format(new Date(columnsReplaced), time_format.toString());
  } catch {
    return `年月日形式エラー : ${column_name}(${columns})`;
  }
};
