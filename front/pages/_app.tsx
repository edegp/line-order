import React, { useEffect, useLayoutEffect, useState } from "react";
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
import { Loader } from "@mantine/core";
import "styles/tailwind.scss";
import "styles/globals.scss";
import "styles/tailwind-utils.scss";
import Layout from "components/Layout";

const liffId: string =
  process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_LIFF_ID
    ? process.env.NEXT_PUBLIC_LIFF_ID
    : "";

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();
  const { message, isLoading } = store.getState();
  const Initialize = async () => {
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
      await store.dispatch(setT(router.locale));
      Promise.all([import("@line/liff"), import("@line/liff-mock")]).then(
        (result) => {
          const liff = result[0].default;
          const LiffMockPlugin = result[1].default;
          // LIFF Initialize
          const mock = Boolean(process.env.NODE_ENV === "development");
          if (mock) {
            liff.use(new LiffMockPlugin());
          }
          liff
            .init({
              liffId,
              // @ts-ignore
              mock,
            })
            .then(() => {
              const loggedIn = liff.isLoggedIn();
              if (!loggedIn) {
                liff.login({
                  redirectUri:
                    router.pathname == "/restaurant/delete"
                      ? `${window.location.origin}/restaurant/delete`
                      : `${window.location.origin}/restaurant`,
                });
              }
              store.dispatch(setFlash({ LIFF_INITED: true }));
            })
            .catch((err) => {
              console.log(err);
            });
        }
      );
    }
    store.dispatch(setIsLoading(false));
  };
  useEffect(() => {
    Initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
  if (isLoading) return <Loader variant="bars" />;
  return (
    <>
      <Provider store={store}>
        <PersistGate
          loading={<Loader variant="bars" className="fix top-1/2 " />}
          persistor={persistor}
        >
          {/* <RestaurantLayout> */}
          <Layout>
            <Component {...pageProps} />
          </Layout>
          {/* </RestaurantLayout> */}
        </PersistGate>
      </Provider>
      {/* </React.StrictMode> */}
    </>
  );
}

export default MyApp;
