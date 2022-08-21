import React, { useState } from "react";
import ErrorModal from "components/ErrorModal";
import { useSelector } from "react-redux";
import { RootState } from "store";

export default function Layout({ children }) {
  // eslint-disable-next-line react-redux/useSelector-prefer-selectors
  const lineUser = useSelector((state: RootState) => state.lineUser);
  const wrap = lineUser ? "wrap" : "hidden";
  return (
    <div className={wrap}>
      {children}
      <ErrorModal />
    </div>
  );
}
