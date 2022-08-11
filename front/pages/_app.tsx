import "../styles/globals.css";
import type { AppProps } from "next/app";
import InitTableOerderItems from "firebase/databease/table-order-items-list";
import { useEffect } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
