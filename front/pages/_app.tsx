import React, { useCallback, useEffect } from "react";
import { Provider } from "react-redux";
import { useRouter } from "next/router";
import {
  store,
  setStarted,
  setLocale,
  setFlash,
  setT,
  persistor,
  setIsLoading,
  setAxiosError,
} from "store";
import { PersistGate } from "redux-persist/integration/react";
import { Box, Loader, MantineProvider } from "@mantine/core";
import "styles/tailwind.scss";
import "styles/globals.scss";
import "styles/tailwind-utils.scss";
import Layout from "components/Layout";
import Head from "next/head";

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
    if (!message?.LIFF_INITED) {
      store.dispatch(setIsLoading(true));
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
      if (liff && router.pathname !== "/tableorder/paymentCompleted") {
        if (!message?.LIFF_INITED) {
          await liff
            .init({
              liffId,
              // @ts-ignore
              mock: false,
              withLoginOnExternalBrowser: true,
            })
            .then(() => {
              // !liff.isLoggedIn() ?? liff.login();
              store.dispatch(setFlash({ LIFF_INITED: true }));
            })
            .catch(() => {
              console.log(message);
              store.dispatch(setAxiosError("LINEログインエラー"));
            });
        }
      }
      store.dispatch(setIsLoading(false));
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
    <>
      <Head>
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width'
        />
      </Head>
      <Provider store={store}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{ respectReducedMotion: false }}
        >
          <PersistGate
            loading={
              <Box className='fixed inset-1/2'>
                <Loader variant='bars' color='green.4' />
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
    </>
  );
}

export default MyApp;
