import {
  Button,
  Text,
  AppShell,
  Title,
  Accordion,
  Card,
  Box,
  Modal,
  Space,
  Group,
} from "@mantine/core";
import MenuHeader from "components/tableorder/Header";
import Ordered from "components/tableorder/Ordered";
import { db } from "fb/firebase-client";
import { doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaCashRegister } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setAxiosError, setIsLoading, store } from "store";
import { LinepayApiResponse, State } from "types";
import { TableOrder } from "utils/table-order";
import LinePay from "/public/image/LINE-Pay(v)_W238_n.png";

export default function Payment() {
  const { t, ordered, paymentId } = useSelector((state: State) => state);
  const dispatch = useDispatch();
  const [paymentModal, setPaymnetModal] = useState(false);
  const router = useRouter();
  const amount =
    typeof router.query?.amount == "string" ? router.query.amount : "";
  const paymentMethods = [
    {
      title: "LINE Pay",
      method: "linePay",
      flex: 10,
      flex_sm: 6,
      image: LinePay,
    },
    {
      title: t?.payment.msg009,
      method: "staffPay",
      flex: 10,
      flex_sm: 4,
      image: undefined,
    },
  ];
  const orderDatetimeFormat = (date: string) => date.slice(0, -3);
  const pay = async (method: string) => {
    dispatch(setIsLoading(true));
    if (method == "linePay") {
      // LINE Payを呼び出しています..
      const response = await TableOrder().reservePayment(paymentId);

      //　LINE Pay決済画面に遷移
      if (typeof window !== "undefined" && response?.data) {
        const linepayApiResponse: LinepayApiResponse = response.data;

        window.location = linepayApiResponse?.info?.paymentUrl?.web;
      }
      dispatch(setIsLoading(false));
    } else if (method == "staffPay") {
      const docRef = doc(db, "TableOrderPaymentOrderInfo", paymentId);
      const transactionId = 99999999999999;
      await updateDoc(docRef, { transactionId })
        .then(() =>
          setTimeout(
            () => {
              dispatch(setIsLoading(false));
              router.push("/tableorder/paymentCompleted");
            },
            3000,
            store.getState()
          )
        )
        .catch(() => {
          dispatch(setIsLoading(false));
          dispatch(
            setAxiosError(
              "店員の呼び出しに失敗しました。近くの店員までお声かけ下さい"
            )
          );
        });
    }
  };
  return (
    <>
      <AppShell header={<MenuHeader />}>
        <Space h='xl' />
        <Button
          onClick={() => setPaymnetModal(true)}
          className='bg-line hover:bg-line/70 active:bg-line/40 block mx-auto w-1/3 min-w-30'
          leftIcon={<FaCashRegister />}
        >
          <Text span>
            {typeof router?.query?.amount == "string" &&
              t?.payment.msg001.replace(
                "{price}",
                parseInt(router?.query?.amount, 10)?.toLocaleString()
              )}
          </Text>
        </Button>
        <Space h='xl' />
        <Text align='center' color='red.6'>
          ※{t?.payment.msg002}
          <br />
          {t?.payment.msg003}
          <br />
          {t?.payment.msg004}
        </Text>
        <Space h='xl' />
        <Accordion variant='separated' className='[&>div]:bg-neutral-200/60'>
          {ordered &&
            ordered.map((order, index) => (
              <Accordion.Item key={index} value={index.toString()}>
                <Accordion.Control>
                  <Group>
                    <Text span color='blue.4'>
                      {orderDatetimeFormat(order.orderDateTime)}
                    </Text>
                    <Space w='xs' />
                    <Text span color='dark.5' weight={700}>
                      {t?.payment.msg005}
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Ordered orders={order.item} />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
        </Accordion>
      </AppShell>
      <Modal
        opened={paymentModal}
        onClose={() => setPaymnetModal(false)}
        title={t?.payment.msg006}
        centered
        classNames={{ modal: "bg-neutral-100" }}
      >
        <Title order={4}>
          {t?.payment.msg007.replace(
            "{price}",
            amount.toLocaleString().toString()
          )}
        </Title>
        {paymentMethods.map((method) => (
          <>
            <Space h='xl' />
            <Card onClick={() => pay(method.method)} shadow='xl'>
              <Card.Section className='text-center'>
                <Title order={4} mt='lg'>
                  {!method.image && <FaCashRegister className='inline' />}
                  {method.title}
                </Title>
              </Card.Section>
              <Group noWrap>
                {method.image && (
                  <Box className='relative w-1/3 h-[12vw] mt-2'>
                    <Image
                      src={method.image}
                      className='absolute top-0 left-0'
                      layout='fill'
                      alt={method.title}
                    />
                  </Box>
                )}
                {method.image && (
                  <Text color='red.5' weight={700} size='sm'>
                    {t?.payment.msg008.split(/<br>/).map((p) => (
                      <>
                        {p}
                        <br />
                      </>
                    ))}
                  </Text>
                )}
              </Group>
            </Card>
          </>
        ))}
      </Modal>
    </>
  );
}
