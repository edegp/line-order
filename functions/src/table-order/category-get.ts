import { TableOrderItemList } from "../common/utils";
import * as functions from "firebase-functions";
import { f } from "..";

export const categoryGet = f.https.onCall(async (data, context) => {
  functions.logger.log(data);
  let categoryList: any = [];
  const categories = await TableOrderItemList.get();
  if (categories)
    categories.forEach((category) => {
      const data = category.data();
      delete data.items;
      functions.logger.log(data);
      categoryList.push(data);
    });
  if (categoryList.length === 0) {
    functions.logger.error("dont get category");
  }

  functions.logger.log("get %s", categoryList[1].categoryName);
  return categoryList;
});
