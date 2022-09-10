import React from "react";
import Thumb from "public/image/thumb.png";
import Head from "next/head";

export default function Meta({
  title = "LINE QRオーダー",
  description = "LINEミニアプリを使ったQRオーダーシステム",
  image = Thumb.src,
  url,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta property='og:title' content={title} />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={image} />
      <meta
        name='viewport'
        content='minimum-scale=1, initial-scale=1, width=device-width'
      />
    </Head>
  );
}
