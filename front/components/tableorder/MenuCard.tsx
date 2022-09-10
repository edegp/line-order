import { Box, Card, Group, Skeleton, Text, Title } from "@mantine/core";
import Image from "next/future/image";
import React, { useCallback } from "react";
import { MdRedo } from "react-icons/md";
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
  const { t } = useSelector((state: State) => state);
  const isDiscounted = menu.discountWay !== 0;
  const discountPrice = menu.price - TableOrder().utils.getDiscountPrice(menu);
  return (
    <Box className='relative'>
      {menu.stockoutFlg && (
        <Box className='absolute top-[35%] left-[20%]'>
          <Text weight='bold' color='red' size='md'>
            Sold out
          </Text>
        </Box>
      )}
      <Box className='hover:shadow-xl'>
        <Skeleton className='static' visible={menu.stockoutFlg}>
          <Card
            className='h-[330px] static'
            onClick={useCallback(() => openDialog(menu), [openDialog])}
          >
            <Group className='h-[150px] w-[240px] mx-auto'>
              {isDiscounted && (
                <Text
                  color='white'
                  className='absolute top-[10px] left-[calc(4vw-45x)] rotate-[-30deg] opacity-90 z-30 rounded-md text-sm py-2 px-3 bg-red-500 '
                >
                  {menu.discountWay === 1 ? (
                    <span>
                      SALE -
                      {t?.menucard.yen.replace(
                        "{price}",
                        menu.discountRate.toString()
                      )}
                    </span>
                  ) : menu.discountWay === 2 ? (
                    <span>SALE -{menu.discountRate}%</span>
                  ) : null}
                </Text>
              )}
              <Box className='mx-auto my-0 relative w-full h-[130px] max-w-[240px]'>
                <Image
                  src={menu.imageUrl}
                  className='absolute t-0 left-0'
                  layout='fill'
                  objectFit='contain'
                />
              </Box>
            </Group>
            {/* </Card.Section> */}

            <Title align='center' className='pt-2 pb-0'>
              {menu.itemName}
            </Title>
            <Title align='center'>
              {isDiscounted ? (
                <Text size='sm'>
                  <span className='line-through'>
                    {t?.menucard.yen.replace(
                      "{price}",
                      menu.price.toLocaleString()
                    )}
                  </span>
                  <MdRedo className='inline text-neutral-500 pb-2' />
                  <span className='text-red-500 text-md font-bold'>
                    {t?.menucard.yen.replace(
                      "{price}",
                      discountPrice.toLocaleString()
                    )}
                  </span>
                </Text>
              ) : (
                <Text size='md'>
                  {t?.menucard.yen.replace(
                    "{price}",
                    menu.price.toLocaleString()
                  )}
                </Text>
              )}
            </Title>
            <Text align='center' color='gray' className='text-sm pt-1'>
              {menu.itemDespription}
            </Text>
          </Card>
        </Skeleton>
      </Box>
    </Box>
  );
}

export default MenuCard;
