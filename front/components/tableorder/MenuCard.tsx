import { Box, Card, Grid, Skeleton, Text, Title } from "@mantine/core";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { MenuType, State } from "types";
import { TableOrder } from "utils/table-order";

function MenuCard({
  menu,
  openDialog,
}: {
  menu: MenuType;
  openDialog: (order: MenuType) => void;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useSelector((state: State) => state);
  const isDiscounted = menu.discountWay !== 0;
  const discountPrice = menu.price - TableOrder().utils.getDiscountPrice(menu);
  return (
    <Box className="relative">
      {menu.stockoutFlg && (
        <Box className="absolute top-[35%] left-[20%]">
          <Text weight="bold" color="red" size="md">
            Sold out
          </Text>
        </Box>
      )}
      <Box className="hover:shadow-lg">
        <Card>
          <Grid>
            <Grid.Col span={12}>
              <Box>
                {isDiscounted && (
                  <Text
                    color="red"
                    className="py-1 px-3 rounded-md text-sm"
                    variant="text"
                  >
                    <span>
                      SALE -
                      {menu.discountWay === 1
                        ? t?.menucard.yen.replace(
                            "{price}",
                            menu.discountRate.toString()
                          )
                        : menu.discountWay === 2
                        ? menu.discountRate
                        : null}
                    </span>
                  </Text>
                )}
              </Box>
            </Grid.Col>
            <Grid.Col span={12}>
              <Title className="pt-2 pb-0">{menu.itemName}</Title>
              <Title className="py-0">
                {isDiscounted ? (
                  <>
                    <span className="line-through">
                      {" "}
                      {t?.menucard.yen.replace(
                        "price",
                        menu.price.toLocaleString()
                      )}
                    </span>
                    <span className="text-red text-sm font-bold">
                      {t?.menucard.yen.replace(
                        "price",
                        discountPrice.toLocaleString()
                      )}
                    </span>
                  </>
                ) : (
                  <span>
                    {t?.menucard.yen.replace(
                      "price",
                      menu.price.toLocaleString()
                    )}
                  </span>
                )}
              </Title>
            </Grid.Col>
          </Grid>
        </Card>
        <Skeleton visible={menu.stockoutFlg}>
          <Card
            className="sxsp:hidden h-[330px]"
            onClick={useCallback(() => openDialog(menu), [openDialog])}
          >
            <Grid>
              <Grid.Col span={12} className="self-center">
                <Box className="h-[150px] w-[240px]">
                  {isDiscounted && (
                    <Text
                      color="red"
                      className="absolute top-[10px] left-[-15px] rotate-[-30deg] opacity-90 z-1 rounded-md text-sm py-2 px-3"
                    >
                      {menu.discountWay === 1 ? (
                        <span>
                          SALE -
                          {t?.menucard.yen.replace(
                            "price",
                            menu.discountRate.toString()
                          )}
                        </span>
                      ) : menu.discountWay === 2 ? (
                        <span>SALE -{menu.discountRate}%</span>
                      ) : null}
                    </Text>
                  )}
                  <Box className="mx-auto my-0">
                    <Image src={menu.imageUrl} width="150px" height="150px" />
                  </Box>
                </Box>
              </Grid.Col>
              <Grid.Col span={12} className="p-0">
                <Title className="pt-2 pb-0">{menu.itemName}</Title>
                <Title>
                  {" "}
                  {isDiscounted ? (
                    <>
                      <span className="line-through">
                        {" "}
                        {t?.menucard.yen.replace(
                          "price",
                          menu.price.toLocaleString()
                        )}
                      </span>
                      <span className="text-red text-sm font-bold">
                        {t?.menucard.yen.replace(
                          "price",
                          discountPrice.toLocaleString()
                        )}
                      </span>
                    </>
                  ) : (
                    <span>
                      {t?.menucard.yen.replace(
                        "price",
                        menu.price.toLocaleString()
                      )}
                    </span>
                  )}
                </Title>
                <Text color="gray" className="text-sm pt-1">
                  {menu.itemDespription}
                </Text>
              </Grid.Col>
            </Grid>
          </Card>
        </Skeleton>
      </Box>
    </Box>
  );
}

export default MenuCard;
