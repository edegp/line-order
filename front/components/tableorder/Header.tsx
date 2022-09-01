import React from "react";
import { Avatar, Button, Grid, Group, Header, Text } from "@mantine/core";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { useSelector } from "react-redux";
import { State } from "types";
import { NextLink } from "@mantine/next";

function MenuHeader() {
  const { t, customer, lineUser } = useSelector((state: State) => state);
  return (
    <Header height={70}>
      <Grid className='mt-[-2px]' justify='space-evenly' align='center'>
        <Grid.Col span={2}>
          <Button
            className='px-1'
            variant='subtle'
            color='dark.4'
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
        <Grid.Col span={6}>
          <Group className='self-center' position='center' align='center'>
            <Avatar
              size='lg'
              src={lineUser.image}
              alt={`${lineUser.name} 様`}
            />
            <Text>{t?.menu.msg001.replace("{name}", customer.name)}</Text>
            <Text className='hidden sp:inline'>
              {t?.menu.msg002}: {customer.seatNo}
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={4}>
          <Text className='text-sm m-auto sp:hidden pr-2'>
            {t?.header.msg002}: {customer.seatNo}
          </Text>
        </Grid.Col>
      </Grid>
    </Header>
  );
}

export default MenuHeader;
