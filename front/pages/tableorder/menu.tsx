import {
  AppShell,
  Avatar,
  Box,
  Button,
  Container,
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
  Slider,
  Popover,
} from "@mantine/core";
import { CountdownTimerIcon, StarFilledIcon } from "@radix-ui/react-icons";
import MenuCard from "components/tableorder/MenuCard";
import React, { useCallback, useEffect, useState } from "react";
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
import Image from "next/future/image";
import { useRouter } from "next/router";
import Basket from "components/tableorder/basket";
import { db } from "fb/firebase-client";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

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
  const openDialog = useCallback(
    (order: any) => {
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
    },
    [addToBasket]
  );
  const avatar = useCallback(
    (category: Category) =>
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
      ),
    []
  );
  const search = useCallback(
    async (categoryId: number, categoryName: string) => {
      setCategoryName(categoryName);
      const docRef = doc(db, "TableOrderItemList", categoryId.toString());
      const itemList: any = (await getDoc(docRef))?.data();
      setMenuList(itemList?.items);
    },
    []
  );
  const countHandler = useCallback(() => {
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
  }, [orders]);
  const handleOrder = useCallback(async () => {
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

    setMenuDialog(false);
    await new Promise(() => setTimeout(() => {}, 100));
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
  }, [orders, addToBasket]);
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
      dispatch(setCustomer({ ...customer, seatNo: 1 }));
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
  }, [dispatch]);
  return (
    <AppShell
      header={
        <Header className='flex' height={70}>
          <Grid
            className='self-center w-full'
            justify='space-evenly'
            align='center'
          >
            <Grid.Col span={1} offset={1}>
              <Menu closeOnClickOutside={true} position='bottom-start'>
                <Menu.Target>
                  <Button
                    color='dark'
                    variant='subtle'
                    className='hover:bg-slate-400 hover:rounded-3xl self-center justify-self-center text-md 
                    
                    p-2 w-[36px]'
                  >
                    <MdMenu className='text-slate-500' />
                  </Button>
                </Menu.Target>
                <Menu.Dropdown className='top-[70px]'>
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
            <Grid.Col span={4} sm={6}>
              <Group className='self-center' position='center' align='center'>
                <Avatar
                  className='hidden sp:block'
                  size='lg'
                  src={lineUser.image}
                  alt={`${lineUser.name} 様`}
                />
                <Text className='hidden sp:block'>
                  {t?.menu.msg001.replace("{name}", customer.name)}
                </Text>
                <Text>
                  {t?.menu.msg002}: {customer.seatNo}
                </Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={5} sm={2}>
              <Button
                disabled={!paymentId}
                className='text-gray bg-transparent'
                rightIcon={<MdKeyboardArrowRight className='text-md' />}
              >
                {t?.menu.msg003}
              </Button>
            </Grid.Col>
          </Grid>
        </Header>
      }
      footer={
        <Footer fixed className='p-0' height={60}>
          <Button
            fullWidth
            className='bg-line text-white w-full h-full hover:bg-line/70 active:bg-line/40'
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
        size='lg'
        radius='sm'
        transitionDuration={200}
        target='.mantine-Container-root'
      >
        {addToBasket.order && (
          <Box className='h-[350px]'>
            <Group className='h-[150px] w-[240px] mx-auto'>
              <Box className='mx-auto my-0 relative w-full h-[130px] max-w-[240px]'>
                <Image
                  src={addToBasket.order?.imageUrl}
                  className='absolute t-0 left-0'
                  layout='fill'
                  objectFit='contain'
                />
              </Box>
            </Group>
            <Title align='center' className='pt-2 pb-0'>
              {addToBasket.order?.itemName}
            </Title>
            <Text align='center' color='gray' className='text-sm pt-1'>
              {addToBasket.order?.itemDespription}
            </Text>
            <Space h='md' />
            <Group align='center' position='center' noWrap>
              {addToBasket.isDiscounted ? (
                <Text size='sm' className='relative'>
                  <span className='absolute top-[-12px] left-[calc(-26px-1vw)] text-white opacity-90 z-30 rounded-2xl text-xs px-2 bg-red-500 '>
                    SALE
                  </span>
                  <span className='text-red-500 text-md font-bold'>
                    {t?.menucard.yen.replace(
                      "{price}",
                      addToBasket.discountedPrice?.toLocaleString()
                    )}
                  </span>
                </Text>
              ) : (
                <Text size='md'>
                  {t?.menucard.yen.replace(
                    "{price}",
                    addToBasket.order?.price?.toLocaleString()
                  )}
                </Text>
              )}
              <MdClose />
              <NumberInput
                defaultValue={1}
                min={1}
                className='max-w-[160px]'
                onChange={(number) =>
                  setAddToBasket({ ...addToBasket, number: number || 0 })
                }
              />
              <span className='text-nuatal-500 text-sm'>個</span>
            </Group>
          </Box>
        )}
        <Button
          fullWidth
          className='absolute left-0 bottom-0 border-line bg-line rounded-none rounded-br-sm rounded-bl-sm hover:bg-line/70 active:bg-line/40'
          onClick={handleOrder}
          rightIcon={<MdAddShoppingCart className='inline text-sm' />}
        >
          {t?.menu.msg008}
        </Button>
      </Modal>
      <Modal
        opened={seatNoModal}
        onClose={() => setSeatNoModal(false)}
        title={t.menu.msg009}
        closeOnClickOutside={false}
        centered
      >
        <Slider
          label={`座席番号 ${customer.seatNo}`}
          labelAlwaysOn
          min={1}
          max={30}
          value={customer.seatNo}
          onChange={(value) =>
            dispatch(setCustomer({ ...customer, seatNo: value }))
          }
          step={1}
          mr={3}
          mt={3}
        />
        <Popover width={200} position='top-end' withArrow shadow='md'>
          <Popover.Target>
            <Box className={"text-right"}>
              <Button className='justify-self-end self-end' mt={20}>
                確認
              </Button>
            </Box>
          </Popover.Target>
          <Popover.Dropdown>
            <Text>確認</Text>
            <Text align='center'>
              本当に
              <br />
              座席番号：{customer.seatNo} 番
              <br />
              で間違いないですか？
            </Text>
            <Button
              mt={10}
              onClick={() => {
                setSeatNoModal(false);
                if (!customer.seatNo) {
                  dispatch(dispatch(setCustomer({ ...customer, seatNo: 1 })));
                }
              }}
            >
              OK
            </Button>
          </Popover.Dropdown>
        </Popover>
      </Modal>
      <Drawer
        lockScroll
        opened={basketDrower}
        onClose={() => setBasketDrower(false)}
        title='バスケット'
        classNames={{
          header:
            "box-content pb-4 border-b border-gray-400/40 mx-[-16px] px-[16px]",
        }}
        padding='md'
        size='90%'
        position='bottom'
        transitionDuration={150}
        transitionTimingFunction='ease-in'
        transition='slide-up'
      >
        <Basket />
      </Drawer>
    </AppShell>
  );
}

export async function getStaticProps() {
  // 商品一覧情報取得APIからメニューデータ取得
  const docRef = doc(db, "TableOrderItemList", "0");
  const data: any = (await getDoc(docRef))?.data();
  const menuList = data?.items;
  const categoryName = data?.categoryName;
  // カテゴリー一覧取得APIからカテゴリー一覧取得
  const citiesRef = collection(db, "TableOrderItemList");
  const snapshot = await getDocs(citiesRef);
  let categoryList = [];
  snapshot.forEach((s) => {
    const data = s.data();
    delete data.items;
    categoryList.push(data);
  });
  return {
    props: {
      title: "LINE QRオーダー メニュー",
      menuList: menuList,
      categoryName: categoryName,
      categoryList: categoryList,
    },
  };
}
