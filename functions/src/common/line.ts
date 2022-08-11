/* eslint-disable linebreak-style */
import * as functions from "firebase-functions";
import line from "@line/bot-sdk";
import axios from "axios";

export const sendPushMessage = (
  channelAccessToken: any,
  flexObj: any,
  userId: string
) => {
  const client = new line.Client({
    channelAccessToken,
    channelSecret: process.env.CHANNEL_SECRET || "",
  });
  let response;
  try {
    response = client.pushMessage(userId, {
      type: "flex",
      altText: "This is a Flex Message",
      content: flexObj,
    });
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
    id_token: idToken,
    client_id: channelId,
  };

  const response = axios.post(process.env.API_USER_ID_URL, {
    headers,
    data: body,
  });

  const resBody = JSON.parse(response.text);
  return resBody;
};
