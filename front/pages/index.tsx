import {
  AppShell,
  Box,
  Button,
  Footer,
  List,
  Text,
  Title,
} from "@mantine/core";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import InitTableOerderItems from "fb/database/table-order-items-list";
import type { NextPage } from "next";
import Image from "next/image";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Beer from "public/image/beer.jpg";
import Head from "next/head";
import Meta from "components/Meta";
import { State, T } from "types";

const Home: NextPage = () => {
  // @ts-ignore
  const t: T = useSelector((state: State) => state.t);
  useEffect(() => {
    InitTableOerderItems();
  }, []);
  return (
    <>
      <Head>
        <Meta
          title="LINEモバイルオーダーデモトップページ"
          image={Beer.src}
          description="LINEミニアプリを使ったモバイルオーダーのデモページです"
          url={
            process.env.NODE_ENV === "development"
              ? `${process.env.URL}/`
              : "http://localhost:3000"
          }
        />
      </Head>
      <AppShell className="[&_main]:p-0">
        <Box className="relative w-full h-full">
          <Image
            src={Beer}
            alt="Table Setting"
            layout="fill"
            objectFit="cover"
          />
        </Box>
        <Box className="mt-5 text-[#555] mx-5">
          <Title
            order={5}
            className="border-l-[12px] border-solid border-[#16C464] text-[#555] px-4"
          >
            {t.top.title}
          </Title>
          <List className="mt-5">
            <List.Item className="mb-5">{t.top.msg001}</List.Item>
            <List.Item>
              {t.top.msg002.split(/<br>/).map((msg) => (
                <>
                  {msg}
                  <br />
                </>
              ))}
            </List.Item>
          </List>
        </Box>
        <Box className="mb-16 mt-5 p-2 leading-5">
          <Text size="sm" color="#7c7c7c" className="mx-5 mb-0">
            {t.top.msg003}
            <br />
            {t.top.msg004}
            <br />
            <br />
            {t.top.msg005}
          </Text>
        </Box>
        <Footer fixed className="p-0" height={"60px"}>
          <Button
            fullWidth
            color="#fff"
            className="h-full bg-[#00B900]"
            href="/tableorder/menu/21"
            component="a"
          >
            <Title className="font-bold">{t.top.msg006}</Title>
            <ChevronRightIcon className="w-12 h-12" />
          </Button>
        </Footer>
      </AppShell>
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const items = await InitTableOerderItems();
  return {
    props: {
      items,
    },
  };
}
