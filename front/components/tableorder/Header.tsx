import React from "react";
import {
  Avatar,
  Box,
  Button,
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

function Header({ customer }: { customer: any }) {
  const { t } = useSelector((state) => state);
  return (
    <Header>
      <Group>
        <Button
          className="bg-gray px-1"
          component="a"
          href={"/tableorder/menu/" + customer.seatNo}
        >
          <ChevronLeftIcon />
          Menu
        </Button>
        <Space />
        <Box>
          <Tooltip
            position="bottom"
            label={t.header.msg001.replace("name", customer.name)}
          >
            {" "}
            <Avatar src={customer.image} />
          </Tooltip>
          <Text className="sp:hidden text-sm m-auto ml-[12px]" weight="bold">
            {t.header.msg001.replace("name", customer.name)}
          </Text>
          <Text className="sp:hidden text-sm m-auto ml-[12px]" weight="bold">
            {t.header.msg002}: {customer.seatNo}
          </Text>
        </Box>
        <Box className="sp:hidden pr-3">
          {" "}
          <Text className="text-sm m-auto">
            {t.header.msg002}: {customer.seatNo}
          </Text>
        </Box>
        <Space />
      </Group>
    </Header>
  );
}

export default Header;
