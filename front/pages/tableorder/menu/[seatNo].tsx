import {
  AppShell,
  Button,
  Container,
  Footer,
  Grid,
  Header,
  List,
  Menu,
  Text,
  Title,
} from "@mantine/core";
import { CountdownTimerIcon, StarFilledIcon } from "@radix-ui/react-icons";
import MenuCard from "components/tableorder/MenuCard";
import React, { ProviderProps, useEffect, useState } from "react";
import { setLineUser, store } from "store";
import { Items, LineUser, MenuType, State, Category, Customer } from "types";
import { ocopy } from "utils/helper";
import { getLiffProfile } from "utils/liff";
import { TableOrder } from "utils/table-order";
import { MdLocalBar, MdShoppingBasket } from "react-icons/md";
import { FaRunning, FaUtensils } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function SeatNo(props: any) {
  let {
    customer,
    // menuList,
    // categoryName,
    categoryList,
    paymentId,
    seatNoModal,
  }: {
    customer: Customer;
    categoryList: Category[];
    paymentId: string;
    seatNoModal: boolean;
  } = props;
  const { t }: State = useSelector((state: State) => state);
  const [menuDialog, setMenuDialog] = useState(false);
  const [categoryName, setCategoryName] = useState(props.categoryName);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [menuList, setMenuList] = useState<MenuType[]>(props.menuList);
  const [addToBasket, setAddToBasket] = useState({
    category: null,
    categoryIcon: null,
    itemId: null,
    number: NaN,
    discountedPrice: NaN,
    isDiscounted: false,
    order: {},
  });
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
    const itemList = (await TableOrder().getItemData(categoryId.toString()))
      ?.data;
    setMenuList(itemList[0]?.items);
    setCategoryDialog(false);
  };
  const count = () => {
    //バスケット内の個数
    let ret = 0;
    const orders = store.getState().orders;
    if (orders) {
      for (const category in orders) {
        const order = orders[category];
        for (const name in order) {
          ret += order[name].count;
        }
      }
    }
    return ret;
  };
  return (
    <AppShell>
      <Header height={"70px"}>
        <Menu>
          <Menu.Label>Menu Category</Menu.Label>
          {categoryList.map((category: Category, index: number) => (
            <Menu.Dropdown
              onClick={() => search(category.categoryId, category.categoryName)}
              key={index}
            >
              <Menu.Item icon={avatar(category)}>
                {category.categoryName}
              </Menu.Item>
            </Menu.Dropdown>
          ))}
        </Menu>
      </Header>
      <Container>
        <Grid>
          <Grid.Col span={12}>
            <Title order={2}>{categoryName}</Title>
          </Grid.Col>
        </Grid>
        <Grid>
          {menuList.map((menu) => (
            <Grid.Col span={6} md={4} key={menu.itemName}>
              <MenuCard menu={menu} openDialog={openDialog} />
            </Grid.Col>
          ))}
        </Grid>
      </Container>
      <Footer fixed className="p-0" height={"60px"}>
        <Button
          fullWidth
          className="bg-[#00B900] text-white w-full h-full"
          component="a"
          href="/tableorder/basket"
          disabled={count() === 0}
        >
          <MdShoppingBasket />
          <Text>
            {t?.menu.msg004}
            {count()}
            {t?.menu.msg005}
          </Text>
        </Button>
      </Footer>
    </AppShell>
  );
}

export async function getServerSideProps({ params }: any) {
  const { lineUser }: State = store.getState();
  let customer = ocopy(lineUser as LineUser);
  if (!customer) {
    const lineUser = await getLiffProfile((await import("@line/liff")).default);
    store.dispatch(setLineUser(lineUser));
    customer = ocopy(lineUser as LineUser);
  }
  delete customer["expire"];

  // 席番号取得　取得できない場合は席番号入力モーダル表示
  let seatNoModal = true;
  if ("seatNo" in params && String(params.seatNo).match(/^[0-9]*$/g)) {
    seatNoModal = false;
    customer["seatNo"] = params.seatNo;
  }
  // 商品一覧情報取得APIからメニューデータ取得
  const { data } = await TableOrder().getItemData();
  const menuList = data[0]?.items;
  const categoryName = data[0]?.categoryName;
  // カテゴリー一覧取得APIからカテゴリー一覧取得
  const categoryList = (await TableOrder().getCategoryData())?.data;
  console.log(categoryList);
  // paymentIdが存在しない場合には取得を試みる
  let { paymentId }: State = store.getState();
  if (paymentId == null) {
    let paymentIdResponse = await TableOrder().getPaymentId();
    paymentId = !paymentIdResponse ? "" : (paymentIdResponse.data as string);
  }

  return {
    props: {
      customer: customer,
      menuList: menuList,
      categoryName: categoryName,
      categoryList: categoryList,
      paymentId: paymentId,
      seatNoModal: seatNoModal,
    },
  };
}
