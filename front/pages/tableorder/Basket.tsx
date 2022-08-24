import {
  AppShell,
  Header,
  Button,
  Footer,
  Container,
  Text,
  Grid,
  Tooltip,
  NumberInput,
  Title,
  Avatar,
  Group,
  Divider,
  Modal,
  Box,
} from "@mantine/core";
import { NextLink } from "@mantine/next";
import Image from "next/image";
import router from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import { FaCashRegister } from "react-icons/fa";
import {
  MdKeyboardArrowLeft,
  MdOutlineDone,
  MdOutlineHorizontalRule,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOrders, setPaymentId } from "store";
import { Order, Orders, State } from "../../../types";
import { ocopy } from "utils/helper";
import { TableOrder } from "utils/table-order";

function Basket() {
  const { t, orders, lineUser, customer, paymentId } = useSelector(
    (state: State) => state
  );
  const dispatch = useDispatch();
  const [total, setTotal] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [orderEnabled, setOrderEnabled] = useState(false);
  const [beforeDiscount, setBeforeDiscount] = useState(0);
  const [removeDialog, setRemoveDialog] = useState(false);
  const [orderDialog, setOrderDialog] = useState(false);
  const handleBeforeDiscount = () => {
    let beforeDiscount = 0;
    if (orders) {
      Object.values(orders).forEach((order) => {
        Object.values(order).forEach((item) => {
          const price = item.order.price;
          const count = item.count;
          beforeDiscount += price * count;
        });
      });
    }
    if (isNaN(beforeDiscount)) {
      beforeDiscount = 0;
    }
    setBeforeDiscount(beforeDiscount);
  };
  const handleTotal = useCallback(() => {
    let totalPrice = 0;
    if (orders) {
      Object.values(orders).forEach((order) => {
        Object.values(order).forEach((item) => {
          const price = item.price;
          const count = item.count;
          totalPrice += price * count;
        });
      });
    }
    if (isNaN(totalPrice)) {
      totalPrice = 0;
    }
    setTotal(totalPrice);
  }, [orders]);
  const handleOrderEnabled = useCallback(() => {
    // 注文ボタン活性制御
    if (orders) {
      Object.values(orders).forEach((order) => {
        Object.values(order).forEach((value) => {
          if (value.count < 1) return setOrderEnabled(false);
        });
      });
      if (orders && Object.keys(orders).length > 0 && !isNaN(total))
        return setOrderEnabled(true);

      return setOrderEnabled(false);
    }
  }, [orders]);
  const hangleTotalDiscount = useCallback(() => {
    let totalDiscount = 0;
    if (orders) {
      Object.values(orders).forEach((order) => {
        Object.keys(order).forEach((key) => {
          const price = TableOrder().utils.getDiscountPrice(
            order[parseInt(key, 10)].order
          );

          const count = order[parseInt(key, 10)].count;
          totalDiscount += price * count;
        });
      });
    }
    if (isNaN(totalDiscount)) {
      totalDiscount = 0;
    }
    setTotalDiscount(totalDiscount);
  }, [orders]);
  const remove = useCallback(
    (categoryId: string, itemId: string, order: Order) => {
      let newOrders = ocopy(orders);
      delete newOrders[categoryId][itemId];
      if (orders) {
        dispatch(setOrders(newOrders));
      }
    },
    [orders, dispatch]
  );
  const order = async () => {
    const tableId = customer.seatNo;
    if (orders) {
      // 注文送信・注文完了APIにデータ送信
      const response = await TableOrder().putOrder(paymentId, tableId, orders);
      dispatch(setPaymentId(response));
    }
    dispatch(setOrders({} as Orders));
    router.push("/tableorder/completed");
  };
  const removeAll = useCallback(() => {
    dispatch(setOrders({} as Orders));
    setRemoveDialog(false);
  }, [orders, dispatch]);
  useEffect(() => {
    handleTotal();
    handleBeforeDiscount();
    hangleTotalDiscount();
    handleOrderEnabled();
  }, [orders]);
  return (
    <AppShell
      header={
        <Header className="flex items-center" height={70}>
          <Button
            component={NextLink}
            variant="subtle"
            color="dark"
            className="hover:bg-slate-400/60 hover:rounded-3xl text-sm"
            leftIcon={<MdKeyboardArrowLeft className="mt-1" />}
            href={{
              pathname: "/tableorder/menu",
              query: { seatNo: customer.seatNo },
            }}
            passHref
          >
            MENU
          </Button>

          <Group className="mx-auto" position="center" align="center">
            <Avatar
              size="lg"
              src={lineUser.image}
              alt={`${lineUser.name} 様`}
            />
            <Text>{t?.menu.msg001.replace("{name}", customer.name)}</Text>
            <Text>
              {t?.menu.msg002}: {customer.seatNo}
            </Text>
          </Group>
        </Header>
      }
      footer={
        <Footer fixed className="p-0" height={60}>
          <Button
            fullWidth
            className="bg-[#00B900] text-white w-full h-full"
            onClick={() => setOrderDialog(true)}
            disabled={!orderEnabled}
            leftIcon={<FaCashRegister />}
          >
            {t?.basket.msg002}
          </Button>
        </Footer>
      }
    >
      <Container fluid className="sp:px-4 px-0">
        <Grid className="text-center">
          <Grid.Col span={5} offset={2}>
            {t?.basket.product}
          </Grid.Col>
          <Grid.Col span={2}>{t?.basket.qty}</Grid.Col>
          <Grid.Col span={2}>{t?.basket.price}</Grid.Col>
        </Grid>
        {orders &&
          Object.keys(orders).map((categoryId) =>
            Object.entries(orders[parseInt(categoryId, 10)]).map(
              ([itemId, order]) => (
                <Grid align="ceter" key={itemId}>
                  <Grid.Col className="flex items-center" span={1}>
                    <Button
                      color="red"
                      variant="outline"
                      radius="xl"
                      onClick={() => remove(categoryId, itemId, order)}
                    >
                      <MdOutlineHorizontalRule />
                    </Button>
                  </Grid.Col>
                  <Grid.Col span={5} offset={1} sm={6} className="tablet:ml-0">
                    <Grid align="center" justify="center">
                      <Grid.Col
                        className="relative w-full h-full min-h-[140px]"
                        span={10}
                        sm={4}
                      >
                        <Image
                          src={order.order.imageUrl}
                          layout="fill"
                          className="abusolute"
                          objectFit="contain"
                        />
                      </Grid.Col>
                      <Grid.Col span={12} sm={7} offset={2} offsetSm={1}>
                        <Tooltip
                          color="gray.6"
                          openDelay={150}
                          position="top-start"
                          label={t?.basket.yen.replace(
                            "{price}",
                            order.order.price.toLocaleString()
                          )}
                        >
                          <Group>
                            <Text color="dark">{order.order.itemName}</Text>
                            {order.order.discountWay === 1 ? (
                              <Button color="red" variant="filled" compact>
                                <span>
                                  SALE -
                                  {t?.menucard.yen.replace(
                                    "{price}",
                                    order.order.discountRate.toString()
                                  )}
                                </span>
                              </Button>
                            ) : order.order.discountWay === 2 ? (
                              <Button color="red" variant="filled" compact>
                                <span>SALE -{order.order.discountRate}%</span>
                              </Button>
                            ) : null}
                          </Group>
                        </Tooltip>
                      </Grid.Col>
                    </Grid>
                  </Grid.Col>
                  <Grid.Col
                    span={3}
                    xs={2}
                    className="flex items-center justify-center"
                  >
                    <NumberInput
                      value={order.count}
                      onChange={(value: any) =>
                        dispatch(
                          setOrders({
                            ...orders,
                            [categoryId]: {
                              ...orders[parseInt(categoryId, 10)],
                              [itemId]: {
                                ...orders[parseInt(categoryId, 10)][
                                  parseInt(itemId, 10)
                                ],
                                count: value,
                              },
                            },
                          })
                        )
                      }
                    />
                  </Grid.Col>
                  <Grid.Col
                    span={2}
                    className="flex items-center justify-center"
                  >
                    <Title align="center">
                      {order.order.discountWay !== 0 ? (
                        <Text size="sm">
                          <span className="line-through">
                            {t?.menucard.yen.replace(
                              "{price}",
                              order.order.price.toLocaleString()
                            )}
                          </span>
                          <br />
                          <span className="text-red-500 text-md font-bold">
                            {t?.menucard.yen.replace(
                              "{price}",
                              (
                                order.order.price -
                                TableOrder().utils.getDiscountPrice(order.order)
                              ).toLocaleString()
                            )}
                          </span>
                        </Text>
                      ) : (
                        <Text size="md">
                          {t?.menucard.yen.replace(
                            "{price}",
                            order.order.price.toLocaleString()
                          )}
                        </Text>
                      )}
                    </Title>
                  </Grid.Col>
                </Grid>
              )
            )
          )}
        <Divider my="sm" />
        {totalDiscount !== 0 && (
          <>
            <Grid>
              <Grid.Col span={5} offset={4}>
                {t?.basket.total_pretax}
              </Grid.Col>
              <Grid.Col span={2} offset={1}>
                {t?.basket.yen.replace(
                  "{price}",
                  beforeDiscount.toLocaleString()
                )}
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={5} offset={4}>
                {t?.basket.total_discount}
              </Grid.Col>
              <Grid.Col span={2} offset={1}>
                <Text color="red" weight={700}>
                  -
                  {t?.basket.yen.replace(
                    "{price}",
                    totalDiscount.toLocaleString()
                  )}
                </Text>
              </Grid.Col>
            </Grid>
          </>
        )}
        <Grid>
          <Grid.Col span={5} offset={4}>
            {t?.basket.total_amount}
          </Grid.Col>
          <Grid.Col span={2} offset={1}>
            <Text color="red" weight={700}>
              {t?.basket.yen.replace("{price}", total.toLocaleString())}
            </Text>
          </Grid.Col>
        </Grid>
        <Box className="flex justify-center mt-vw-4">
          <Button
            color="red"
            variant="outline"
            onClick={() => setRemoveDialog(true)}
            className="mx-auto"
          >
            {t?.basket.msg001}
          </Button>
        </Box>
      </Container>
      <Modal
        opened={removeDialog}
        className="whitespace-pre-wrap break-words"
        title={t?.basket.msg005.split(/<br>/).map((p, index) => (
          <Text key={index}>{p}</Text>
        ))}
        closeButtonLabel={t?.basket.cancel}
        onClose={() => setRemoveDialog(false)}
      >
        <Button onClick={removeAll}>OK</Button>
      </Modal>
      <Modal
        opened={orderDialog}
        title={
          <>
            <MdOutlineDone />
            &nbsp;
            {t?.basket.msg003}
          </>
        }
        onClose={() => setOrderDialog(false)}
        closeButtonLabel={t?.basket.cancel}
      >
        <Button onClick={order}>OK</Button>
      </Modal>
    </AppShell>
  );
}

export default Basket;
