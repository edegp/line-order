import {
  Title,
  Text,
  Button,
  AppShell,
  Header,
  Grid,
  Container,
  Divider,
  Box,
  Loader,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { MdDone, MdOutlineHouse } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { State } from "types";
import linePay from "public/image/LINE-Pay2.png";
import { setPaymentError, setPaymentId } from "store";
import { useRouter } from "next/router";
import { TableOrder } from "utils/table-order";
import Image from "next/image";
import { NextLink } from "@mantine/next";

export default function PaymentCompleted() {
  const { t, isLoading } = useSelector((state: State) => state);
  const [linepay, setLinepay] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    const { transactionId, orderId: paymentId } = router.query;
    if (typeof transactionId !== "string") {
      dispatch(setPaymentId(null));
      setLinepay(false);
      setSuccess(true);
    } else if (typeof paymentId == "string") {
      setLinepay(true);
      TableOrder()
        .confirmPayment(transactionId, paymentId)
        .then(() => {
          setSuccess(false);
          dispatch(setPaymentError(true));
        })
        .catch(() => dispatch(setPaymentId(null)));
    }
  });
  if (isLoading)
    return (
      <Box className='fixed inset-1/2'>
        <Loader variant='bars' color='green.4' />
        <Text>
          店員を呼び出し中
          <br />
          しばらくお待ちください
        </Text>
      </Box>
    );
  return (
    <AppShell
      header={
        <Header className='flex items-center' height={70}>
          <Title order={2} ml={15}>
            {t?.paymentCompleted.title}
          </Title>
        </Header>
      }
    >
      <Container>
        <Grid className='text-center' justify='cetner'>
          <Grid.Col>
            <Title order={3}>
              <MdDone className='inline text-line mr-2' />
              {t?.paymentCompleted.msg001}
            </Title>
            <Divider my='lg' />
            <Text>{t?.paymentCompleted.msg002}</Text>
          </Grid.Col>
          {linepay && (
            <div className='relative w-full h-full'>
              <Image
                className='absolute top-0 left-0'
                src={linePay}
                alt='LINE Pay'
                layout='fill'
              />
            </div>
          )}
          <Button
            mt='sm'
            className='w-[200px] bg-line hover:bg-line/70 active:bg-line/40 text-white mx-auto'
            component={NextLink}
            href='/'
            passHref
            leftIcon={<MdOutlineHouse className='text-lg' />}
          >
            {t?.paymentCompleted.msg003}
          </Button>
        </Grid>
      </Container>
    </AppShell>
  );
}
