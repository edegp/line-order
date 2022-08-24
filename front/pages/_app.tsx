import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Provider } from "react-redux";
// import RestaurantLayout from "components/RestaurantLayout";
import { useRouter } from "next/router";
import {
  store,
  setStarted,
  setLocale,
  setLineUser,
  setFlash,
  setT,
  persistor,
  setIsLoading,
} from "store";
import { PersistGate } from "redux-persist/integration/react";
import { Box, Loader } from "@mantine/core";
import "styles/tailwind.scss";
import "styles/globals.scss";
import "styles/tailwind-utils.scss";
import Layout from "components/Layout";

const liffId: string =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_LIFF_ID
    ? process.env.NEXT_PUBLIC_LIFF_ID
    : "";

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();
  const { message, isLoading } = store.getState();
  const Initialize = useCallback(async () => {
    store.dispatch(setIsLoading(true));
    if (!message?.LIFF_INITED) {
      store.dispatch(
        setStarted(
          new Date().toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
          })
        )
      );
      // 言語
      if ("lang" in router.query) {
        store.dispatch(setLocale(router.query.lang));
      }
      store.dispatch(setT(router.locale));
      const liff = (await import("@line/liff")).default;
      if (process.env.NODE_ENV === "development") {
        const LiffMockPlugin = (await import("@line/liff-mock")).default;
        liff.use(new LiffMockPlugin());
      }
      if (liff) {
        liff
          .init({
            liffId,
            // @ts-ignore
            mock: process.env.NODE_ENV === "development" ? true : false,
          })
          .then(() => {
            const loggedIn = liff.isLoggedIn();
            if (!loggedIn) {
              liff.login();
            }
            store.dispatch(setFlash({ LIFF_INITED: true }));
            store.dispatch(setIsLoading(false));
          })
          .catch(() => {
            console.log(message);
            store.dispatch(setIsLoading(false));
          });
      }
    }
  }, [message]);
  useEffect(() => {
    Initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (isLoading) return <Loader variant="bars" />;
  return (
    <>
      <Provider store={store}>
        <PersistGate
          loading={
            <Box className="fixed inset-1/2">
              <Loader variant="bars" />
            </Box>
          }
          persistor={persistor}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PersistGate>
      </Provider>
      {/* </React.StrictMode> */}
    </>
  );
}

export default MyApp;
