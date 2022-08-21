import React from "react";

const Meta = ({ title, description, image, url }: any) => {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
    </>
  );
};

export default Meta;
