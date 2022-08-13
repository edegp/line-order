/* eslint-disable linebreak-style */
import * as functions from "firebase-functions";
import { Client as linebot } from "@line/bot-sdk";
import axios from "axios";
import { Client as linePay } from "line-pay-sdk";

export const pay = new linePay({
  channelId: process.env.LINE_PAY_CHANNEL_ID || "",
  channelSecret: process.env.LINE_PAY_CHANNEL_SECRET || "",
});

export const client = new linebot({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || "",
  channelSecret: process.env.CHANNEL_SECRET || "",
});

export const sendPushMessage = (
  channelAccessToken: any,
  flexObj: any,
  userId: string
) => {
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
};

export const getProfile = (idToken: any, channelId: any) => {
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  const body = {
    idToken: idToken,
    clientId: channelId,
  };

  const response: any = axios.post(process.env.API_USER_ID_URL as string, {
    headers,
    data: body,
  });

  const resBody = JSON.parse(response.text);
  return resBody;
};
