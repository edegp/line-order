import { TableOrderItemList } from "./../common/utils";
/* eslint-disable linebreak-style */
/* eslint-disable indent */
import * as functions from "firebase-functions";
import { f } from "..";

export const categoryGet = f.https.onRequest(async (req, res) => {
  const getCategory = () =>
    TableOrderItemList.get().then((categories) => {
      categories.forEach((category) => delete category.data().items);
    });

  functions.logger.log(req);
  const categories = await getCategory();
  res.json(categories);
});
