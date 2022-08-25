import React, { ReactNode, useState } from "react";
import ErrorModal from "components/ErrorModal";
import { useSelector } from "react-redux";
import { Box, Loader } from "@mantine/core";
import { State } from "types";

export default function Layout({ children }: { children: ReactNode }) {
  // eslint-disable-next-line react-redux/useSelector-prefer-selectors
  const { lineUser, isLoading } = useSelector((state: State) => state);
  const wrap = lineUser ? "wrap" : "hidden";
  if (isLoading)
    return (
      <Box className="fixed inset-1/2">
        <Loader variant="bars" color="green.6" />
      </Box>
    );
  return (
    <div className={wrap}>
      {children}
      <ErrorModal />
    </div>
  );
}
