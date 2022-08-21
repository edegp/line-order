import { Container, Divider, Grid, Text } from "@mantine/core";
import { orderBy } from "firebase/firestore";
import Image from "next/image";
import React from "react";
import { useSelector } from "react-redux";

function Ordered({ orders }: { orders: any }) {
  const { t } = useSelector((state) => state);
  const orderTotal = (order) => {
    let totalPrice = 0;
    for (const orderId in order) {
      const item = order[orderId];
      const price = item.price - getDiscountPrice(item);
      totalPrice = totalPrice + price * item.orderNum;
    }
    return t.ordered.yen.replace("{price}", totalPrice.toLocaleString());
  };
  return (
    <Container>
      <Grid align="center">
        <Grid.Col span={4} md={4}>
          {t.ordered.msg001}
        </Grid.Col>
        <Grid.Col span={2} md={2}>
          {t.ordered.msg002}
        </Grid.Col>
        <Grid.Col span={2} md={2}>
          {t.ordered.msg003}
        </Grid.Col>
        <Grid.Col span={3} md={3}>
          {t.ordered.msg004}
        </Grid.Col>
      </Grid>
      <Divider my="sm" />
      {orders.map((order) => (
        <Grid align="center" key={order.itemId} justify="center">
          <Grid.Col sm={2}>
            <Image
              src={order.imageUrl}
              width={200}
              height={150}
              className="m-auto"
            />
          </Grid.Col>
          <Grid.Col span={4} sm={2} className="text-center m-auto">
            <Image
              src={order.imageUrl}
              width={90}
              max-height={80}
              className="m-auto"
            />
            <Text weight={700}>
              {order.itemName}
              <span className="text-red ml-1 px-1 rounded-md whitespace-norap">
                {orderBy.discounsWay !== 1 && (
                  <span>
                    {t.ordered.yen.replace("{name}", order.discountRate)}
                  </span>
                )}
                {orderBy.discounsWay !== 2 && (
                  <span>-{order.discountRate}%</span>
                )}
              </span>
            </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <span className="text-sm">
              {t.ordered.yen.replace(
                "{price}",
                order.price - getDiscountPrice(order)
              )}
            </span>
          </Grid.Col>
          <Grid.Col span={2}>
            <span className="text-sm">{order.orderNum}</span>
          </Grid.Col>
          <Grid.Col span={3}>
            <span className="text-sm">
              {t.ordered.yen.replace(
                "{price}",
                order.price - getDiscountPrice(order) * order.orderNum
              )}
            </span>
          </Grid.Col>
        </Grid>
      ))}

      <Grid align="center">
        <Grid.Col span={7} md={8}>
          <Text weight={700} align="right" size="sm">
            {t.ordered.msg005}
          </Text>
        </Grid.Col>
        <Grid.Col span={4} md={2}>
          <Text weight={700} align="right" size="sm">
            {orderTotal(value)}
          </Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default Ordered;
