import { tableOerderItems } from "order-item/table_order_items";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase-client";

export default function InitTableOerderItems() {
  const items: object[] = [];
  tableOerderItems.forEach(async (item: any) => {
    try {
      const docRef = await addDoc(collection(db, "TableOrderItemList"), item);
      console.log("Document written with ID: ", docRef.id);
      items.push(docRef);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  });
  return items;
}
