import {
  createSlice,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { getLiffProfile } from "utils/liff";
import ja from "public/locales/ja";
import { State } from "types";
import { Liff } from "@line/liff";

const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["message"], // What you don't wanna to persist
  // whitelist: ['auth'] // What you want to persist
};

const initialState: State = {
  message: {
    no: "",
    restaurant: {
      id: NaN,
      name: "",
      img: "",
      address: "",
      start: "",
      end: "",
      holiday: "",
      tel: "",
      line: "",
      budget: NaN,
      seats: NaN,
      smoking: NaN,
      map: [],
    },
    name: "",
    course: {
      id: NaN,
      name: "",
      time: NaN,
      price: NaN,
      comment: "",
      text: "",
      value: NaN,
    },
    day: "",
    people: NaN,
    start: "",
    end: "",
    LIFF_INITED: false,
  },
  started: "",
  locales: ["ja"],
  locale: "ja",
  sessionId: "",
  lineUser: {
    expire: NaN,
    userId: "",
    name: "",
    image: "",
    token: "",
    idToken: "",
  },
  t: {
    type: "",
    language: "",
    title: "",
    top: {
      title: "",
      msg001: "",
      msg002: "",
      msg003: "",
      msg004: "",
      msg005: "",
      msg006: "",
    },
    menu: {
      msg001: "",
      msg002: "",
      msg003: "",
      msg004: "",
      msg005: "",
      msg006: "",
      msg007: "",
      msg008: "",
      msg009: "",
      msg010: "",
      msg011: "",
      msg012: "",
      msg013: "",
    },
    basket: {
      product: "",
      qty: "",
      price: "",
      yen: "",
      total_pretax: "",
      total_discount: "",
      total_amount: "",
      cancel: "",
      msg001: "",
      msg002: "",
      msg003: "",
      msg004: "",
      msg005: "",
    },
    completed: {
      msg001: "",
      msg002: "",
      msg003: "",
    },
    payment: {
      msg001: "",
      msg002: "",
      msg003: "",
      msg004: "",
      msg005: "",
      msg006: "",
      msg007: "",
      msg008: "",
      msg009: "",
      msg010: "",
      msg011: "",
    },
    paymentCompleted: {
      title: "",
      msg001: "",
      msg002: "",
      msg003: "",
    },
    header: {
      msg001: "",
      msg002: "",
    },
    menucard: {
      yen: "",
    },
    ordered: {
      yen: "",
      msg001: "",
      msg002: "",
      msg003: "",
      msg004: "",
      msg005: "",
    },
    utils: {
      sun: "",
      mon: "",
      tue: "",
      wed: "",
      thu: "",
      fri: "",
      sat: "",
      hol: "",
    },
    tableorder: {},
    error: {
      msg001: "",
      msg002: "",
      msg003: "",
      msg004: "",
      msg005: "",
      msg006: "",
      msg007: "",
      msg008: "",
    },
  },
  isLoading: false,
  paymentId: "",
  customer: {
    seatNo: NaN,
    userId: "",
    name: "",
    image: "",
    token: "",
  },
};

const initMessage = {
  no: "",
  restaurant: {
    id: NaN,
    name: "",
    img: "",
    address: "",
    start: "",
    end: "",
    holiday: "",
    tel: "",
    line: "",
    budget: NaN,
    seats: NaN,
    smoking: NaN,
    map: [],
  },
  name: "",
  course: {
    id: NaN,
    name: "",
    time: NaN,
    price: NaN,
    comment: "",
    text: "",
    value: NaN,
  },
  day: "",
  people: NaN,
  start: "",
  end: "",
  LIFF_INITED: false,
};

const restaurantSlice = createSlice({
  name: "reserve",
  initialState,
  reducers: {
    clear(state) {
      return {
        ...state,
        message: initMessage,
        started: "",
        locale: "ja",
        lineUser: {
          expire: NaN,
          userId: "",
          name: "",
          image: "",
          token: "",
          idToken: "",
        },
        restaurant: undefined,
        axiosError: undefined,
      };
    },
    setStarted(state, action) {
      state.started = action.payload;
    },
    setLocale(state, action) {
      if (state.locales?.includes(action.payload))
        state.locale = action.payload;
    },
    setSession(state, action) {
      state.sessionId = action.payload;
    },
    setLineUser(state, action) {
      state.lineUser = action.payload;
    },
    setAxiosError(state, action) {
      state.axiosError = action.payload;
    },
    setFlash(state, action) {
      state.message = {
        ...state.message,
        ...action.payload,
      };
    },
    clearFlash(state, action) {
      if (!action.payload) {
        state.message = initMessage;
      } else if (state.message && action.payload in state.message) {
        state.message[action.payload] = undefined;
      }
    },
    setT(state, action) {
      state.t = action.payload === "ja" ? ja : ja;
    },
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setPaymentError(state, action) {
      state.paymentError = action.payload;
    },
    setPaymentId(state, action) {
      state.paymentId = action.payload;
    },
    setCustomer(state, action) {
      state.customer = action.payload;
    },
    setOrders(state, action) {
      state.orders = action.payload;
    },
    setOrdered(state, action) {
      state.ordered = action.payload;
    },
  },
});

const persistedReducer = persistReducer(persistConfig, restaurantSlice.reducer);

export const {
  clear,
  setStarted,
  setLocale,
  setSession,
  setLineUser,
  setAxiosError,
  setFlash,
  clearFlash,
  setT,
  setIsLoading,
  setPaymentError,
  setCustomer,
  setOrders,
  setOrdered,
  setPaymentId,
} = restaurantSlice.actions;
export default persistedReducer;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(setFlash, setIsLoading),
  effect: (action, listenerApi) => {
    const { lineUser, message }: any = listenerApi.getState();
    if (message?.LIFF_INITED) {
      import("@line/liff").then((result) => {
        const liff = result.default;
        //  　LIFFプロファイル取得・設定
        const _settingLiffProfile = async (liff: Liff) => {
          const _lineUser = await getLiffProfile(liff);
          listenerApi.dispatch(setLineUser(_lineUser));
        };
        // LIFF Login & Profile
        if (!lineUser || !("expire" in lineUser)) {
          // Get LIFF Profile & Token
          _settingLiffProfile(liff);
        } else {
          const now = new Date();
          const expire = parseInt(lineUser.expire, 10);
          if (expire < now.getTime()) {
            // Get LIFF Profile & Token
            _settingLiffProfile(liff);
          }
        }
      });
    }
  },
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ["persist/PERSIST"] },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);
