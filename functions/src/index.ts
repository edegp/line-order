/* eslint-disable indent */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export const ItemListGet = functions.https.onRequest(async (req, res) => {
  const getItemList = async (params: unknown) => {
    if (typeof params === "string") params = parseInt(params, 10);
    const items = await admin
      .firestore()
      .collection("TableOrderItemList")
      .where("categoryId", "==", params);
    functions.logger.log("items %s", items);
    return items;
  };
  functions.logger.log(req.query);
  const items = await getItemList(req.query);
  if (items) {
    functions.logger.log("Occur Exception: %s", items);
  }
  return res.json(items);
});

export const CategoryGet = functions.https.onRequest(async (req, res) => {
  const getCategory = () =>
    admin
      .firestore()
      .collection("TableOrderItemList")
      .get()
      .then((categories) => {
        categories.forEach((category) => delete category.data().items);
      });

  functions.logger.log(req);
  const categories = await getCategory();
  return res.json(categories);
});

export const OrderInfoGet = functions.https.onRequest(async (req, res) => {
  functions.logger.log(req);
  if (!req.query)
    new functions.https.HttpsError(400, process.env.MSG_ERROR_NOPARAM);
  params = req.query;
  pramChecker = TableOrderParamCheck(params);
});
