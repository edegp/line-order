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
import { Box, Loader, MantineProvider } from "@mantine/core";
import "styles/tailwind.scss";
import "styles/globals.scss";
import "styles/tailwind-utils.scss";
import Layout from "components/Layout";

const liffId: string =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_LIFF_ID
    ? process.env.NEXT_PUBLIC_LIFF_ID
    : process.env.NEXT_PUBLIC_LIFF_ID_DEV
    ? process.env.NEXT_PUBLIC_LIFF_ID_DEV
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
  const { message } = store.getState();
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
            withLoginOnExternalBrowser: true,
            // @ts-ignore
            mock: false,
          })
          .then(() => {
            store.dispatch(setFlash({ LIFF_INITED: true }));
            store.dispatch(setIsLoading(false));
          })
          .catch(() => {
            console.log(message);
            store.dispatch(setIsLoading(false));
          });
      } else {
        store.dispatch(setIsLoading(false));
      }
    }
  }, [message]);
  useEffect(() => {
    Initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    router.events.on("routeChangeStart", () =>
      store.dispatch(setIsLoading(true))
    );
    router.events.on("routeChangeComplete", () =>
      store.dispatch(setIsLoading(false))
    );
    router.events.on("routeChangeError", () =>
      store.dispatch(setIsLoading(false))
    );
    return () => {
      router.events.off("routeChangeStart", () =>
        store.dispatch(setIsLoading(true))
      );
      router.events.off("routeChangeComplete", () =>
        store.dispatch(setIsLoading(false))
      );
      router.events.off("routeChangeError", () =>
        store.dispatch(setIsLoading(false))
      );
    };
  }, [router]);
  return (
    <Provider store={store}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <PersistGate
          loading={
            <Box className="fixed inset-1/2">
              <Loader variant="bars" color="green.4" />
            </Box>
          }
          persistor={persistor}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PersistGate>
      </MantineProvider>
    </Provider>
  );
}

export default MyApp;
