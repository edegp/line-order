import {
  AppShell,
  Header,
  Menu,
  Button,
  Footer,
  Container,
  Text,
  Grid,
  Tooltip,
  NumberInput,
  Title,
} from "@mantine/core";
import { orderBy } from "firebase/firestore";
import Image from "next/image";
import React from "react";
import { FaCashRegister } from "react-icons/fa";
import {
  MdArrowBackIosNew,
  MdMenu,
  MdOutlineHorizontalRule,
  MdRedo,
  MdShoppingBasket,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setOrders } from "store";
import { State } from "types";
import { TableOrder } from "utils/table-order";
import menu from "./menu";

function Basket() {
  const { t, orders } = useSelector((state: State) => state);
  const dispatch = useDispatch();
  const total = () => {
    let totalPrice = 0;
    if (orders) {
      Object.values(orders)
        .flat()
        .forEach((itemId) => {
          const price = itemId.price;
          const count = itemId.count;
          totalPrice += price * count;
        });
    }
    if (isNaN(totalPrice)) {
      totalPrice = 0;
    }
    return totalPrice;
  };
  const orderEnabled = () => {
    // 注文ボタン活性制御
    if (orders) {
      Object.values(orders)
        .flat()
        .map((value) => {
          if (value.count < 1) {
            return false;
          }
        });
    }
    if (orders && Object.keys(orders).length > 0 && !isNaN(total())) {
      return true;
    }
    return false;
  };
  return (
    <AppShell
      header={
        <Header className="flex" height={70}>
          <MdArrowBackIosNew />
          Menu
        </Header>
      }
      footer={
        <Footer fixed className="p-0" height={60}>
          <Button
            fullWidth
            className="bg-[#00B900] text-white w-full h-full"
            component="a"
            href="/tableorder/basket"
            disabled={!orderEnabled()}
          >
            <FaCashRegister />
            <Text>{t?.basket.msg002}</Text>
          </Button>
        </Footer>
      }
    >
      <Container>
        <Grid>
          <Grid.Col span={4} md={4} offset={1}>
            {t?.basket.product}
          </Grid.Col>
          <Grid.Col span={3} md={3}>
            {t?.basket.qty}
          </Grid.Col>
          <Grid.Col span={4} md={4}>
            {t?.basket.price}
          </Grid.Col>
        </Grid>
        {orders &&
          Object.entries(orders).map(([categoryId, items]) =>
            items.map((order, itemId) => (
              <Grid>
                <Grid.Col span={1}>
                  <Button>
                    <MdOutlineHorizontalRule />
                  </Button>
                </Grid.Col>
                <Grid.Col span={3} md={3}>
                  <Grid>
                    <Grid.Col>
                      <Image
                        src={order.order.imageUrl}
                        height={200}
                        width={150}
                      />
                    </Grid.Col>
                    <Tooltip
                      label={t?.basket.yen.replace(
                        "{price}",
                        order.order.price.toLocaleString()
                      )}
                    >
                      <Grid.Col>
                        <Text>
                          {order.order.itemName}
                          <span>
                            {order.order.discountWay === 1 ? (
                              <span>
                                SALE -
                                {t?.menucard.yen.replace(
                                  "{price}",
                                  order.order.discountRate.toString()
                                )}
                              </span>
                            ) : order.order.discountWay === 2 ? (
                              <span>SALE -{order.order.discountRate}%</span>
                            ) : null}
                          </span>
                        </Text>
                      </Grid.Col>
                    </Tooltip>
                  </Grid>
                </Grid.Col>
                <Grid.Col span={4} md={4}>
                  <NumberInput
                    value={order.count}
                    onChange={(value: any) =>
                      dispatch(
                        setOrders({
                          ...orders,
                          [categoryId]: { count: value }[itemId],
                        })
                      )
                    }
                  />
                </Grid.Col>
                <Grid.Col span={4} md={4}>
                  {" "}
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
            ))
          )}

        <Grid>
          <Grid.Col span={4} md={4} offset={1}>
            {t?.basket.product}
          </Grid.Col>
          <Grid.Col span={3} md={3}>
            {t?.basket.qty}
          </Grid.Col>
          <Grid.Col span={4} md={4}>
            {t?.basket.price}
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={4} md={4} offset={1}>
            {t?.basket.product}
          </Grid.Col>
          <Grid.Col span={3} md={3}>
            {t?.basket.qty}
          </Grid.Col>
          <Grid.Col span={4} md={4}>
            {t?.basket.price}
          </Grid.Col>
        </Grid>
      </Container>
    </AppShell>
  );
}

export default Basket;
