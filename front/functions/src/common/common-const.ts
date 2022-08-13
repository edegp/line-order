/* eslint-disable linebreak-style */
import {
  TemplateMessage,
  TemplateColumn,
  Action,
  TemplateCarousel,
  QuickReplyItem,
  FlexMessage,
} from "@line/bot-sdk";

export const CAROUSEL: TemplateMessage = {
  type: "template",
  altText: "Carousel template",
  template: {
    type: "carousel",
    columns: [
      {
        thumbnailImageUrl:
          "https://media.istockphoto.com/photos/neon-sale-glowing-text-sign-sale-banner-design-3d-render-glow-sale-picture-id854550186",
        title: "最大80%OFF",
        text: "期間限定SALE",
        actions: [
          {
            label: "Go to SALE",
            text: "Choose SALE",
          } as Action,
        ],
      } as TemplateColumn,
      {
        thumbnailImageUrl:
          "https://media.istockphoto.com/photos/womens-clothes-set-isolatedfemale-clothing-collage-picture-id1067767654",
        title: "今月のおススメ商品",
        text: "これがあれば困らない！",
        actions: [
          {
            label: "Recommended",
            text: "Choose Recommended",
          } as Action,
        ],
      } as TemplateColumn,
      {
        thumbnailImageUrl:
          "https://media.istockphoto.com/photos/clothes-hanging-on-rail-in-white-wardrobe-picture-id518597694",
        title: "スッキリ収納特集",
        text: "大切なお洋服をスッキリ簡単に収納します",
        actions: [
          {
            label: "To receive clothes",
            text: "Choose receive clothes",
          } as Action,
        ],
      } as TemplateColumn,
    ],
  } as TemplateCarousel,
};

export const QUICK_REPLY_ITEMS = [
  { action: { label: "位置情報" } as Action } as QuickReplyItem,
  { action: { label: "カメラ起動" } as Action } as QuickReplyItem,
  {
    action: { label: "カメラロール起動" } as Action,
  } as QuickReplyItem,
];

export const MENU_LIST = {
  message: process.env.RICH_MENU_MESSAGE,
  carousel: process.env.RICH_MENU_CAROUSEL,
  flex: process.env.RICH_MENU_FLEX,
};

export const FLEX_COUPON: FlexMessage = {
  type: "flex",
  altText:
    "ご来店ありがとうございました。またのご来店をお待ちしています。次回ご来店時に使用できるクーポンを発行します。",
  contents: {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "10%割引クーポン発行",
          size: "sm",
          color: "#36DB34",
          weight: "bold",
        },
        {
          type: "text",
          text: "Use Case 居酒屋",
          size: "xxl",
          weight: "bold",
        },
      ],
      paddingBottom: "2%",
    },
    hero: {
      type: "image",
      url: "https://media.istockphoto.com/vectors/percent-off-sale-and-discount-price-tag-icon-or-sticker-vector-vector-id1194658271?s=2048x2048",
      size: "full",
      aspectRatio: "2:1",
      aspectMode: "cover",
      action: {
        type: "uri",
        label: "Action",
        uri: `https://liff.line.me/${process.env.LIFF_CHANNEL_ID}`,
      },
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              // eslint-disable-next-line max-len
              text: "ご利用ありがとうございました。\n\n次回来店時に本メッセージを店員に提示していただければ、会計から10 % 割引させていただきます。",
              wrap: true,
              size: "sm",
              color: "#767676",
            },
          ],
        },
      ],
      paddingTop: "5%",
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "spacer",
          size: "md",
        },
      ],
      flex: 0,
    },
  },
};
