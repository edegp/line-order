import { tableOerderItems } from "order-item/table-order-items";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase-client";

export default function InitTableOerderItems() {
  const items: object[] = [];
  tableOerderItems.forEach(async (item: any) => {
    try {
      await setDoc(
        doc(db, "TableOrderItemList", item.categoryId.toString()),
        item
      );
      console.log("Document written with ID: ", item.categoryId);
      items.push(item);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  });
  return items;
}
