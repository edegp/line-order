import { functions } from "fb/firebase-client";
import { Orders, State } from "../../functions/src/types";
import { store } from "store";
import { httpsCallable } from "firebase/functions";
import { showHttpError } from "./helper";

export const TableOrder = () => {
  const firestore = {
    itemData: async (categoryId: number) => {
      // 送信パラメーター
      const myInit = {
        locale: store.getState().locale,
        categoryId: categoryId,
      };
      const itemListGet = httpsCallable(functions, "itemListGet");
      // GET送信
      let response;
      try {
        response = await itemListGet(myInit);
      } catch (error) {
        showHttpError(error);
      }

      return response;
    },

    categoryData: async () => {
      let response = null;
      // 送信パラメーター
      const myInit = {
        locale: store.getState().locale,
      };
      const categoryGet = httpsCallable(functions, "categoryGet");
      // GET送信
      try {
        response = await categoryGet(myInit);
      } catch (error) {
        showHttpError(error);
      }
      return response;
    },

    order: async (params: any) => {
      let response = null;
      // 送信パラメーターロケール付加
      params["locale"] = store.getState().locale;
      // 送信パラメーター
      const myInit = params;

      const orderPut = httpsCallable(functions, "orderPut");
      // POST送信
      try {
        response = await orderPut(myInit);
      } catch (error) {
        showHttpError(error);
      }

      return response;
    },

    // orderData: async (paymentId: string) => {
    //   let response = null;
    //   // 送信パラメーター
    //   const myInit = {
    //     locale: store.getState().locale,
    //     paymentId: paymentId,
    //   };
    //   const orderInfoGet = httpsCallable(functions, "orderInfoGet");
    //   // GET送信
    //   try {
    //     response = await orderInfoGet(myInit);
    //   } catch (error) {
    //     showHttpError(error);
    //   }

    //   return response;
    // },

    reserve: async (params: { [x: string]: string | null | undefined }) => {
      let response = null;
      // 送信パラメーターロケール付加
      params["locale"] = store.getState().locale;
      // 送信パラメーター
      const myInit = params;
      const reserve = httpsCallable(functions, "reserve");
      // POST送信
      try {
        response = await reserve(myInit);
      } catch (error) {
        showHttpError(error);
      }

      return response;
    },

    paymentConfirm: async (params: {
      transactionId: string;
      paymentId: string;
      locale?: string;
    }) => {
      // 送信パラメーター
      const myInit = params;
      // 送信パラメーターロケール付加
      myInit["locale"] = store.getState().locale;
      const paymentConfirm = httpsCallable(functions, "confirm");
      // POST送信
      let isError = false;
      try {
        await paymentConfirm(myInit);
      } catch (error) {
        showHttpError(error);
        isError = true;
      }
      return isError;
    },

    // noLinePayConfirm: async (params: {
    //   idToken: string;
    //   paymentId: string;
    //   locale?: string;
    // }) => {
    //   let response = null;
    //   // 送信パラメーターロケール付加
    //   params["locale"] = store.getState().locale;
    //   // 送信パラメーター
    //   const myInit = params;
    //   const confirmNolinepay = httpsCallable(functions, "confirmNolinepay");
    //   // POST送信
    //   try {
    //     response = await confirmNolinepay(myInit);
    //   } catch (error) {
    //     showHttpError(error);
    //   }

    //   return response;
    // },
    paymentData: async (idToken: any) => {
      let response = null;
      // 送信パラメーター
      const myInit = {
        locale: store.getState().locale,
        idToken: idToken,
      };
      const idGet = httpsCallable(functions, "idGet");
      // GET送信
      try {
        response = await idGet(myInit);
      } catch (error) {
        showHttpError(error);
      }

      return response;
    },
  };

  return {
    utils: {
      getDiscountPrice(order: any) {
        let p = 0;

        if (order.discountWay == 1) {
          p = order.discountRate;
        }
        if (order.discountWay == 2) {
          p = order.price * order.discountRate * 0.01;
        }
        return Math.floor(p);
      },
    },
    // async getItemData(categoryId = 0) {
    //   const itemData = await firestore.itemData(categoryId);
    //   return itemData as HttpsCallableResult<Items>;
    // },
    // async getCategoryData() {
    //   const categories = await firestore.categoryData();
    //   return categories;
    // },
    async putOrder(tableId: number, orders: Orders, paymentId?: string) {
      let items = [];
      for (const order in orders) {
        for (const item in orders[order]) {
          const categoryId = orders[order][item].order.categoryId;
          const itemId = orders[order][item].order.itemId;
          const orderNum = orders[order][item].count;

          items.push({
            categoryId: categoryId,
            itemId: itemId,
            orderNum: orderNum,
          });
        }
      }
      // LIFF ID Token取得
      const { lineUser }: State = store.getState();
      const idToken = lineUser?.idToken;
      const userId = lineUser?.userId;
      let params = null;
      if (paymentId == null) {
        params = { userId, idToken, tableId, item: items };
      } else {
        params = {
          userId,
          paymentId,
          idToken,
          tableId,
          item: items,
        };
      }

      const itemData = await firestore.order(params);
      return itemData;
    },

    // async getOrderData(paymentId: string) {
    //   const orderData = (await firestore.orderData(paymentId))
    //     ?.data as PaymentInfo;
    //   return orderData;
    // },

    async reservePayment(paymentId: string) {
      // LIFF ID Token取得
      const { lineUser }: State = store.getState();
      const idToken = lineUser?.idToken;
      const params = { idToken, paymentId };
      const response = await firestore.reserve(params);
      return response;
    },

    async confirmPayment(transactionId: string, paymentId: string) {
      const params = { transactionId, paymentId };
      const response = await firestore.paymentConfirm(params);
      return response;
    },
    // async comfirmNoLinePay(paymentId: string) {
    //   // LIFF ID Token取得
    //   const { lineUser }: State = store.getState();
    //   const idToken = lineUser?.idToken;
    //   const params = { idToken, paymentId };
    //   const response = await firestore.noLinePayConfirm(params);
    //   return response;
    // },
    async getPaymentId() {
      // LIFF ID Token取得
      const { lineUser }: State = store.getState();
      const idToken = lineUser?.idToken;
      const paymentId = await firestore.paymentData(idToken);
      return paymentId;
    },
  };
};
