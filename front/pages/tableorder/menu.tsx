import {
  AppShell,
  Avatar,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  Drawer,
  Footer,
  Grid,
  Group,
  Header,
  Menu,
  Modal,
  NumberInput,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { CountdownTimerIcon, StarFilledIcon } from "@radix-ui/react-icons";
import MenuCard from "components/tableorder/MenuCard";
import React, { useEffect, useState } from "react";
import { setCustomer, setOrders, setPaymentId } from "store";
import { MenuType, State, Category } from "types";
import { ocopy } from "utils/helper";
import { TableOrder } from "utils/table-order";
import {
  MdAddShoppingCart,
  MdClose,
  MdKeyboardArrowRight,
  MdLocalBar,
  MdMenu,
  MdShoppingBasket,
} from "react-icons/md";
import { FaRunning, FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { useRouter } from "next/router";
import Basket from "components/tableorder/basket";

export default function SeatNo(props: any) {
  let {
    categoryList,
  }: {
    categoryList: Category[];
  } = props;
  const { t, orders, lineUser, paymentId, customer }: State = useSelector(
    (state: State) => state
  );

  const router = useRouter();
  const dispatch = useDispatch();
  const [menuDialog, setMenuDialog] = useState(false);
  const [categoryName, setCategoryName] = useState(props.categoryName);
  const [count, setCount] = useState(NaN);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [menuList, setMenuList] = useState<MenuType[]>(props.menuList);
  const [seatNoModal, setSeatNoModal] = useState(false);
  const [addToBasket, setAddToBasket] = useState({
    category: null,
    categoryIcon: null,
    itemId: NaN,
    number: NaN,
    discountedPrice: NaN,
    isDiscounted: false,
    target: null as any,
    order: {} as MenuType,
  });
  const [basketDrower, setBasketDrower] = useState(false);
  const openDialog = (order: any) => {
    const { itemId, categoryName, price, discountWay } = order;
    setAddToBasket({
      ...addToBasket,
      itemId,
      category: categoryName,
      number: 1,
      discountedPrice: price - TableOrder().utils.getDiscountPrice(order),
      isDiscounted: Boolean(discountWay !== 0),
      order: order,
    });
    setMenuDialog(true);
  };
  const avatar = (category: Category) =>
    category.categoryId === 0 || category.categoryId === 10 ? (
      <StarFilledIcon />
    ) : category.categoryId === 1 || category.categoryId === 11 ? (
      <MdLocalBar />
    ) : category.categoryId === 2 || category.categoryId === 12 ? (
      <FaRunning />
    ) : category.categoryId === 3 || category.categoryId === 13 ? (
      <FaUtensils />
    ) : (
      (category.categoryId === 5 || category.categoryId === 15) ?? (
        <CountdownTimerIcon />
      )
    );
  const search = async (categoryId: number, categoryName: string) => {
    setCategoryName(categoryName);
    const itemList = (await TableOrder().getItemData(categoryId))?.data;
    setMenuList(itemList?.items);
    setCategoryDialog(false);
  };
  const countHandler = () => {
    //バスケット内の個数
    let ret = 0;
    if (orders) {
      for (const category in orders) {
        const order = orders[category];
        for (const name in order) {
          ret += order[name].count;
        }
      }
    }
    setCount(ret);
  };
  const handleOrder = () => {
    const categoryId = addToBasket.order.categoryId;
    const itemId = addToBasket.itemId;
    const price = addToBasket.isDiscounted
      ? addToBasket.discountedPrice
      : addToBasket.order.price;
    const number = addToBasket.number;
    const order = addToBasket.order;
    // すでにバスケット内にあるアイテムであれば個数を加算する
    let ordersObject = ocopy(orders) || {};
    if (
      ordersObject &&
      ordersObject[categoryId] &&
      ordersObject[categoryId][itemId]
    ) {
      let count = ordersObject[categoryId][itemId].count;
      let total = ordersObject[categoryId][itemId].total;
      count += number;
      total += price * number;

      ordersObject[categoryId][itemId] = {
        price: price,
        count: count,
        total: total,
        order: order,
      };
    } else {
      ordersObject[categoryId] = {
        ...ordersObject[categoryId],
        [itemId]: {
          price: price,
          count: number,
          total: price * number,
          order: order,
        },
      };
    }
    dispatch(setOrders({ ...orders, ...ordersObject }));
    // Clear
    setAddToBasket({
      category: null,
      categoryIcon: null,
      itemId: NaN,
      number: NaN,
      discountedPrice: NaN,
      isDiscounted: false,
      target: null as any,
      order: {} as MenuType,
    });
    // Close Dialog
    setMenuDialog(false);
  };
  useEffect(() => {
    countHandler();
  }, [orders]);
  useEffect(() => {
    // 席番号取得　取得できない場合は席番号入力モーダル表示
    if (
      typeof router.query?.seatNo === "string" &&
      router.query.seatNo.toString().match(/^[0-9]*$/g)
    ) {
      setSeatNoModal(false);
      dispatch(
        setCustomer({ ...customer, seatNo: parseInt(router.query?.seatNo, 10) })
      );
    } else {
      setSeatNoModal(true);
    }
    // paymentIdが存在しない場合には取得を試みる
    if (!paymentId) {
      TableOrder()
        .getPaymentId()
        .then((paymentIdResponse) =>
          dispatch(setPaymentId(paymentIdResponse?.data))
        );
    }
  }, [dispatch, router.query]);
  return (
    <AppShell
      header={
        <Header height={70}>
          <Grid className="mt-[-2px]" justify="space-around" align="center">
            <Grid.Col span={1}>
              <Menu closeOnClickOutside={true} position="bottom-start">
                <Menu.Target>
                  <Button
                    color="dark"
                    variant="subtle"
                    className="hover:bg-slate-400 hover:rounded-3xl self-center justify-self-center text-md ml-6 p-2 w-[36px]"
                  >
                    <MdMenu className="text-slate-500" />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown className="top-[70px]">
                  <Menu.Label>Menu Category</Menu.Label>
                  {categoryList.map((category: Category, index: number) => (
                    <Menu.Item
                      icon={avatar(category)}
                      key={index}
                      onClick={() =>
                        search(category.categoryId, category.categoryName)
                      }
                    >
                      {category.categoryName}
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
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
              <Button
                disabled={!paymentId}
                className="text-gray bg-transparent"
                rightIcon={<MdKeyboardArrowRight className="text-md" />}
              >
                {t?.menu.msg003}
              </Button>
            </Grid.Col>
          </Grid>
        </Header>
      }
      footer={
        <Footer fixed className="p-0" height={60}>
          <Button
            fullWidth
            className="bg-[#00B900] text-white w-full h-full hover:bg-[#00B900]/70"
            onClick={() => setBasketDrower(true)}
            disabled={count === 0}
          >
            <MdShoppingBasket />
            <Text>
              {t?.menu.msg004}
              {count}
              {t?.menu.msg005}
            </Text>
          </Button>
        </Footer>
      }
    >
      <Container>
        <Grid>
          <Grid.Col span={12}>
            <Title order={2}>{categoryName}</Title>
          </Grid.Col>
        </Grid>
        <Grid>
          {menuList.map((menu) => (
            <Grid.Col span={12} md={4} sm={6} key={menu.itemName}>
              <MenuCard menu={menu} openDialog={openDialog} />
            </Grid.Col>
          ))}
        </Grid>
      </Container>
      <Modal
        opened={menuDialog}
        withCloseButton
        onClose={() => setMenuDialog(false)}
        size="lg"
        radius="sm"
        target=".mantine-Container-root"
      >
        {addToBasket.order && (
          <Box className="h-[350px]">
            <Group className="h-[150px] w-[240px] mx-auto">
              <Box className="mx-auto my-0 relative w-full h-[130px] max-w-[240px]">
                <Image
                  src={addToBasket.order?.imageUrl}
                  className="absolute t-0 left-0"
                  layout="fill"
                  objectFit="contain"
                />
              </Box>
            </Group>
            <Title align="center" className="pt-2 pb-0">
              {addToBasket.order?.itemName}
            </Title>
            <Text align="center" color="gray" className="text-sm pt-1">
              {addToBasket.order?.itemDespription}
            </Text>
            <Space h="md" />
            <Group align="center" position="center" noWrap>
              {addToBasket.isDiscounted ? (
                <Text size="sm" className="relative">
                  <span className="absolute top-[-10px] left-[-35px] text-white opacity-90 z-30 rounded-2xl text-xs px-2 bg-red-500 ">
                    SALE
                  </span>
                  <span className="text-red-500 text-md font-bold">
                    {t?.menucard.yen.replace(
                      "{price}",
                      addToBasket.discountedPrice?.toLocaleString()
                    )}
                  </span>
                </Text>
              ) : (
                <Text size="md">
                  {t?.menucard.yen.replace(
                    "{price}",
                    addToBasket.order?.price?.toLocaleString()
                  )}
                </Text>
              )}
              <MdClose />
              <NumberInput
                defaultValue={1}
                className="max-w-[160px]"
                onChange={(number) =>
                  setAddToBasket({ ...addToBasket, number: number || 0 })
                }
              />
              <span className="text-nuatal-500 text-sm">個</span>
            </Group>
          </Box>
        )}
        <Button
          fullWidth
          className="absolute left-0 bottom-0 border-[#00B900] bg-[#00B900] rounded-none rounded-br-sm rounded-bl-sm hover:bg-[#00B900]/70"
          onClick={handleOrder}
          rightIcon={<MdAddShoppingCart className="inline text-sm" />}
        >
          {t?.menu.msg008}
        </Button>
      </Modal>
      <Drawer
        opened={basketDrower}
        onClose={() => setBasketDrower(false)}
        title="バスケット"
        padding="xl"
        size="90%"
        position="bottom"
        transitionDuration={150}
        transitionTimingFunction="ease-in"
        transition="slide-up"
      >
        <Basket />
      </Drawer>
    </AppShell>
  );
}

export async function getStaticProps() {
  // 商品一覧情報取得APIからメニューデータ取得
  const { data } = await TableOrder().getItemData();
  const menuList = data?.items;
  const categoryName = data?.categoryName;
  // カテゴリー一覧取得APIからカテゴリー一覧取得
  const categoryList = (await TableOrder().getCategoryData())?.data;

  return {
    props: {
      menuList: menuList,
      categoryName: categoryName,
      categoryList: categoryList,
    },
  };
}
