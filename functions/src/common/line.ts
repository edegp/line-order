import * as dotenv from "dotenv";
dotenv.config();
import "dotenv/config.js";
import * as functions from "firebase-functions";
import { Client as linebot } from "@line/bot-sdk";
import axios from "axios";
const linePay = require("line-pay-v3");

export const pay = new linePay({
  channelId: process.env.LINE_PAY_CHANNEL_ID as string,
  channelSecret: process.env.LINE_PAY_CHANNEL_SECRET as string,
});

export const client = new linebot({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN as string,
  channelSecret: process.env.CHANNEL_SECRET as string,
});

const line = {
  sendPushMessage: (channelAccessToken: any, flexObj: any, userId: string) => {
    let response;
    try {
      response = client.pushMessage(userId, flexObj);
    } catch (e) {
      // functions.logger.error(
      //   "Got exception from LINE Messaging API: %s\n" % e.message
      // );
      functions.logger.error("Occur Exception: %s", e);
    }
    return response;
  },

  getProfile: async (idToken: any, channelId: any) => {
    const data = new URLSearchParams({
      id_token: idToken,
      client_id: channelId,
    });
    try {
      const response = await axios.post(
        process.env.API_USER_ID_URL as string,
        data
      );
      return response.data;
    } catch (e) {
      functions.logger.error("Occur Exception: %s", e);
    }
  },
};

export default line;
