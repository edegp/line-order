import InitTableOerderItems from "fb/database/table-order-items-list";
import { ocopy } from "utils/helper";
import { LineUser, Message, T, State } from "../../types";
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

const initMessage = {
  no: "",
  name: "",
  day: "",
  people: NaN,
  start: "",
  end: "",
  LIFF_INITED: false,
};

const initialState: State = {
  message: initMessage,
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
  t: {} as T,
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
    cleaAll(state) {
      return initialState;
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
  cleaAll,
} = restaurantSlice.actions;
export default persistedReducer;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: setFlash,
  effect: (action, listenerApi) => {
    const state: unknown = listenerApi.getState();
    const { message, lineUser } = state as State;
    if (message?.LIFF_INITED) {
      import("@line/liff").then(async (result) => {
        const liff = result.default;
        //  　LIFFプロファイル取得・設定
        const _settingLiffProfile = async (liff: Liff) => {
          const _lineUser = await getLiffProfile(liff);
          if (_lineUser) listenerApi.dispatch(setLineUser(_lineUser));
        };
        // LIFF Login & Profile
        if (!lineUser?.name || !lineUser.expire) {
          // Get LIFF Profile & Token
          _settingLiffProfile(liff);
        } else {
          const now = new Date();
          const expire = lineUser.expire;
          if (expire < now.getTime()) {
            // Get LIFF Profile & Token
            _settingLiffProfile(liff);
          }
        }
      });
    }
  },
});

listenerMiddleware.startListening({
  actionCreator: setLineUser,
  effect: (action, listenerApi) => {
    InitTableOerderItems();
    let customer = ocopy(action.payload);
    delete customer["expire"];
    if (customer) listenerApi.dispatch(setCustomer(customer));
  },
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }).prepend(listenerMiddleware.middleware),
});

export const persistor = persistStore(store);
