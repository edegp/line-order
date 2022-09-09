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
import React from "react";
import { useSelector } from "react-redux";
import Beer from "public/image/beer.jpg";
import { State } from "types";
import { NextLink } from "@mantine/next";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const t = useSelector((state: State) => state.t);
  const router = useRouter();
  return (
    <AppShell className='[&_main]:p-0'>
      <Box className='relative w-full h-full'>
        <Image src={Beer} alt='Table Setting' layout='fill' objectFit='cover' />
      </Box>
      <Box className='mt-5 text-[#555] mx-5'>
        <Title
          order={5}
          className='border-l-[12px] border-solid border-[#16C464] text-[#555] px-4'
        >
          {t?.top.title}
        </Title>
        <List className='mt-5'>
          <List.Item className='mb-5'>{t?.top.msg001}</List.Item>
          <List.Item>
            {t?.top.msg002.split(/<br>/).map((msg: string) => (
              <span key={msg}>
                {msg}
                <br />
              </span>
            ))}
          </List.Item>
        </List>
      </Box>
      <Box className='mb-16 mt-5 p-2 leading-5'>
        <Text size='sm' color='#7c7c7c' className='mx-5 mb-0'>
          {t?.top.msg003}
          <br />
          {t?.top.msg004}
          <br />
          <br />
          {t?.top.msg005}
        </Text>
      </Box>
      <Footer fixed className='p-0' height={"60px"}>
        <Button
          fullWidth
          color='#fff'
          className='h-full bg-line border-line hover:bg-line/70 active:bg-line/40'
          component={NextLink}
          href={{ pathname: "/tableorder/menu", query: { ...router.query } }}
          passHref
          rightIcon={<ChevronRightIcon className='w-12 h-12' />}
        >
          <Title order={2}>{t?.top.msg006}</Title>
        </Button>
      </Footer>
    </AppShell>
  );
};

export default Home;

export async function getStaticProps() {
  const items = await InitTableOerderItems();
  return {
    props: {
      items,
      title: "LINEモバイルオーダーデモトップページ",
      image: Beer.src,
      url:
        process.env.NODE_ENV !== "development"
          ? `${process.env.URL}/`
          : "http://localhost:3000",
      description: "LINEミニアプリを使ったモバイルオーダーのデモページです",
    },
  };
}
