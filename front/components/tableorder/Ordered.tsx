import { Box, Container, Divider, Grid, Text } from "@mantine/core";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PaymentInfo } from "types";
import { TableOrder } from "utils/table-order";
import { OrderItem, State } from "../../../functions/src/types";

function Ordered({ orders }: { orders: OrderItem[] }) {
  const { t } = useSelector((state: State) => state);

  const orderTotal = (order: OrderItem[]) => {
    let totalPrice = 0;
    for (const orderId in order) {
      const item = order[orderId];
      const price = item.price - discount(item);
      totalPrice = totalPrice + price * item.orderNum;
    }
    return totalPrice;
  };
  const discount = (item: OrderItem) =>
    TableOrder().utils.getDiscountPrice(item);
  return (
    <Container>
      <Grid align="center">
        <Grid.Col span={4} md={4}>
          {t?.ordered.msg001}
        </Grid.Col>
        <Grid.Col span={2} md={2}>
          {t?.ordered.msg002}
        </Grid.Col>
        <Grid.Col span={2} md={2}>
          {t?.ordered.msg003}
        </Grid.Col>
        <Grid.Col span={3} md={3}>
          {t?.ordered.msg004}
        </Grid.Col>
      </Grid>
      <Divider my="sm" />
      {orders.map((order) => (
        <Grid align="center" key={order.itemId}>
          <Grid.Col className="hidden sp:!block" span={2}>
            <Image
              src={order.imageUrl}
              width={200}
              height={150}
              className="m-auto"
              alt={order.itemName}
            />
          </Grid.Col>
          <Grid.Col span={2} className="text-center">
            <Box className="m-auto max-h-20 block sp:!hidden">
              <Image
                src={order.imageUrl}
                width={90}
                height={80}
                alt={order.itemName}
              />
            </Box>
            <Text weight={700}>
              {order.itemName}
              <Text
                span
                className="text-red ml-1 px-1 rounded-md whitespace-nowrap"
              >
                {order.discountWay == 2 && (
                  <Text span className="bg-red-500 text-white rounded-xl px-2">
                    -
                    {t?.ordered.yen.replace(
                      "{price}",
                      order.discountRate.toString()
                    )}
                  </Text>
                )}
                {order.discountWay == 1 && (
                  <Text span className="bg-red-500 text-white rounded-xl px-2">
                    -{order.discountRate}%
                  </Text>
                )}
              </Text>
            </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text size="sm" weight={700}>
              {t?.ordered.yen.replace(
                "{price}",
                (order.price - discount(order)).toString()
              )}
            </Text>
          </Grid.Col>
          <Grid.Col span={2}>
            <Text size="sm" weight={700}>
              {order.orderNum}
            </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text size="sm" weight={700}>
              {t?.ordered.yen.replace(
                "{price}",
                (order.price - discount(order) * order.orderNum).toString()
              )}
            </Text>
          </Grid.Col>
        </Grid>
      ))}

      <Grid align="center">
        <Grid.Col span={7}>
          <Text weight={700} align="right" size="sm">
            {t?.ordered.msg005}
          </Text>
        </Grid.Col>
        <Grid.Col span={3} offset={2} md={2}>
          <Text weight={700} size="sm">
            {t?.ordered.yen.replace(
              "{price}",
              orderTotal(orders).toLocaleString()
            )}
          </Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Ordered;
