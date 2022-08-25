import { checkLength, checkRequired } from "./param-check";

export const tableOrderParamCheck = (params: {
  categoryId: number;
  tableId: number;
  paymentId: any;
  transactionId?: any;
  item: {
    categoryId: number;
    itemId: number;
    orderNum: number;
  }[];
}) => {
  const { tableId, paymentId, transactionId, item } = params;
  const errorMessage: string[] = [];
  const checkTableId = () => {
    let error = checkRequired(tableId, "tableId");
    if (error) {
      errorMessage.push(error);
      return;
    }
    error = checkLength(tableId, "tableId", 1, NaN);
    if (error) errorMessage.push(error);
  };
  // const checkCategoryId = () => {
  //   let error = checkRequired(categoryId, "categoryId");
  //   if (error) {
  //     errorMessage.push(error);
  //     return;
  //   }
  //   error = checkLength(categoryId, "categoryId", 1, NaN);
  //   if (error) errorMessage.push(error);
  // };
  const checkPaymentId = () => {
    let error = checkRequired(paymentId, "paymentId");
    if (error) {
      errorMessage.push(error);
      return;
    }
    error = checkLength(paymentId, "paymentId", 1, NaN);
    if (error) errorMessage.push(error);
  };
  const checkTransactionId = () => {
    let error = checkRequired(transactionId, "transactionId");
    if (error) {
      errorMessage.push(error);
      return;
    }
    error = checkLength(transactionId, "transactionId", 1, NaN);
    if (error) errorMessage.push(error);
  };
  const checkItem = () => {
    const checkCategoryId = (categoryId: number) => {
      const error = checkRequired(categoryId, "categoryId");
      if (error) {
        errorMessage.push(error);
        return;
      }
    };
    const checkItemId = (itemId: number) => {
      let error = checkRequired(itemId, "itemId");
      if (error) {
        errorMessage.push(error);
        return;
      }
      error = checkLength(itemId, "itemId", 1, NaN);
      if (error) errorMessage.push(error);
    };
    const checkOrderNum = (orderNum: number) => {
      const error = checkRequired(orderNum, "orderNum");
      if (error) {
        errorMessage.push(error);
        return;
      }
    };
    const error = checkRequired(item, "item");
    if (error) {
      errorMessage.push(error);
      return;
    }
    for (const itemSingle of item) {
      checkCategoryId(itemSingle?.categoryId);
      checkItemId(itemSingle?.itemId);
      checkOrderNum(itemSingle?.orderNum);
    }
  };
  return {
    checkApiOrderPut: () => {
      checkTableId();
      checkItem();
      return errorMessage;
    },
    checkApiOrderInfo: () => {
      checkPaymentId();
      return errorMessage;
    },
    checkApiPaymentReserve: () => {
      checkPaymentId();
      return errorMessage;
    },
    checkApiPaymentConfirm: () => {
      checkTransactionId();
      checkPaymentId();
      return errorMessage;
    },
    checkApiPaymentConfirmNolinepay: () => {
      checkPaymentId();
      return errorMessage;
    },
  };
};
