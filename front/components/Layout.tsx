import React, { ReactNode } from "react";
import ErrorModal from "components/ErrorModal";
import { Box, LoadingOverlay } from '@mantine/core'
import { useSelector } from 'react-redux'
import { State } from 'types'

export default function Layout({ children }: { children: ReactNode }) {
  const { lineUser, isLoading } = useSelector((state: State) => state)
  const wrap = lineUser ? 'wrap' : 'hidden'
  return (
    <>
      <Box className='fixed inset-1/2 bg-white'>
        <LoadingOverlay
          loaderProps={{ variant: 'bars', color: 'green.6' }}
          visible={isLoading}
          overlayBlur={2}
        />
      </Box>
      <div className={wrap}>
        {children}
        <ErrorModal />
      </div>
    </>
  )
}
