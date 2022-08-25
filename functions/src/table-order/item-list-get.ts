import { getCategoryItem } from "../common/utils";
import * as functions from "firebase-functions";
import { f } from "..";

const getItemList = async (params: { locale: string; categoryId: number }) => {
  let categoryId = 1;
  if (params?.categoryId || params?.categoryId == 0)
    categoryId = params.categoryId;
  const items = await getCategoryItem(categoryId);
  functions.logger.debug(items);
  return items;
};

export const itemListGet = f.https.onCall(async (data, context) => {
  functions.logger.log(data);
  const items = await getItemList(data);
  if (!items) {
    functions.logger.log("Occur Exception: %s", items);
  }
  return items;
});
