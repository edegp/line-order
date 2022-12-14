import {
  Button,
  AppShell,
  Footer,
  Container,
  Title,
  Divider,
  Grid,
  Text,
} from "@mantine/core";
import MenuHeader from "components/tableorder/Header";
import { db } from "fb/firebase-client";
import { doc, getDoc } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { FaCashRegister } from "react-icons/fa";
import { MdOutlineDone } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setIsLoading, setOrdered } from "store";
import { State } from "types";

export default function Complete() {
  const { t, paymentId } = useSelector((state: State) => state);
  const router = useRouter();
  const dispatch = useDispatch();
  const payment = async () => {
    dispatch(setIsLoading(true))
    const docRef = doc(db, "TableOrderPaymentOrderInfo", paymentId);
    const itemResponse = (await getDoc(docRef))?.data();
    if (!itemResponse) {
      return { noOrder: true };
    }
    const ordered = itemResponse?.order.reverse();
    const amount = itemResponse?.amount;
    dispatch(setOrdered(ordered));
    router.push({ pathname: "/tableorder/payment", query: { amount } });
    dispatch(setIsLoading(false))
  };
  return (
    <>
      <Head>
        <title>注文完了ページ</title>
      </Head>
      <AppShell
        header={<MenuHeader />}
        footer={
          <Footer height={60}>
            <Button
              fullWidth
              className='bg-line text-white w-full h-full hover:bg-line/70 active:bg-line/40'
              onClick={payment}
            >
              <FaCashRegister className='inline mr-3' />
              {t?.completed.msg003}
            </Button>
          </Footer>
        }
      >
        <Container className='mt-[20vh]'>
          <Grid align='center' justify='center'>
            <Grid.Col>
              <Title order={4} align='center'>
                <MdOutlineDone className='inline mr-4 text-line' />
                {t?.completed.msg001}
              </Title>
              <Divider my='md' />
              <Text align='center'>{t?.completed.msg002}</Text>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell>
    </>
  );
}
