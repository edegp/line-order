import { getCategoryItem } from "./../common/utils";
import * as functions from "firebase-functions";
import { f } from "..";

const getItemList = async (params: any) => {
  let categoryId = 1;
  if (params?.categoryId) categoryId = parseInt(params.categoryId);
  const items = await getCategoryItem(categoryId);
  functions.logger.debug("items %s", items);
  return items;
};

export const itemListGet = f.https.onRequest(
  async (
    req: { query: any },
    res: { json: (arg0: FirebaseFirestore.DocumentData[]) => void }
  ) => {
    functions.logger.log(req.query);
    const items = await getItemList(req.query);
    if (items) {
      functions.logger.log("Occur Exception: %s", items);
    }
    res.json(items);
  }
);
