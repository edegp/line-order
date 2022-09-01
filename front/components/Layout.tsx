import React, { ReactNode } from "react";
import ErrorModal from "components/ErrorModal";
import { Box, Loader } from "@mantine/core";
import { store } from "store";

export default function Layout({ children }: { children: ReactNode }) {
  const { lineUser, isLoading } = store.getState();
  const wrap = lineUser ? "wrap" : "hidden";
  if (isLoading)
    return (
      <Box className='fixed inset-1/2'>
        <Loader variant='bars' color='green.6' />
      </Box>
    );
  return (
    <div className={wrap}>
      {children}
      <ErrorModal />
    </div>
  );
}
