import React from "react";
import {
  Avatar,
  Box,
  Button,
  Grid,
  Group,
  Header,
  Space,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useRouter } from "next/router";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useSelector } from "react-redux";
import { State } from "types";
import { NextLink } from "@mantine/next";

function MenuHeader() {
  const { t, customer, lineUser } = useSelector((state: State) => state);
  return (
    <Header height={70}>
      <Grid className="mt-[-2px]" justify="space-around" align="center">
        <Grid.Col span={1}>
          <Button
            className="px-1"
            variant="subtle"
            color="dark.4"
            component={NextLink}
            href={{
              pathname: "/tableorder/menu/",
              query: { seatNo: customer.seatNo },
            }}
          >
            <ChevronLeftIcon />
            Menu
          </Button>
        </Grid.Col>
        <Grid.Col span={7}>
          <Group className="self-center" position="center" align="center">
            <Avatar
              className="hidden sp:block"
              size="lg"
              src={lineUser.image}
              alt={`${lineUser.name} 様`}
            />
            <Text className="hidden sp:block">
              {t?.menu.msg001.replace("{name}", customer.name)}
            </Text>
            <Text>
              {t?.menu.msg002}: {customer.seatNo}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={2}>
          <Box className="sp:hidden pr-3">
            <Text className="text-sm m-auto">
              {t?.header.msg002}: {customer.seatNo}
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Header>
  );
}

export default MenuHeader;
