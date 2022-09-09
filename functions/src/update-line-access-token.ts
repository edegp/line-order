import axios, { AxiosResponse } from "axios";
import { format } from "date-fns";
import { addDays } from "date-fns";
import { ChannelAccessToken } from "./common/utils";
const functions = require("firebase-functions");

const updateLimitedChannelAccessToken = (
  channelId: string,
  channelAccessToken: string
) => {
  const now = new Date();
  const limitDate = format(addDays(now, 20), "yyyy-MM-dd HH:mm:ssz");

  ChannelAccessToken.doc(channelId).update({
    channelAccessToken,
    limitDate,
  });
};

const getChannelAccessToken = async (
  channelId: string,
  channelSecret: string
) => {
  const data = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: channelId,
    client_secret: channelSecret,
  });
  const response: AxiosResponse = await axios.post(
    process.env.API_ACCESSTOKEN_URL as string,
    data
  );
  let accessToken;
  if (response) {
    accessToken = response.data?.access_token;
    functions.logger.info("new_channel_access_token %s", accessToken);
  }

  return accessToken;
};

export const updateLineAccessToken = functions.pubsub
  .schedule("0 0 * * *")
  .onRun(() => {
    functions.logger.info("update lineAT");
    ChannelAccessToken.get().then((q) => {
      q.forEach(async (item) => {
        try {
          let channelAccessToken;
          if (item.data().channelAccessToken) {
            const limitDate = new Date(item.data().limitDate);
            const now = new Date();
            const { channelSecret } = JSON.parse(JSON.stringify(item?.data()));
            const channelId = item.id;
            if (limitDate < now) {
              channelAccessToken = await getChannelAccessToken(
                channelId,
                channelSecret
              );
              updateLimitedChannelAccessToken(channelId, channelAccessToken);
              functions.logger.info("channelId: %s updated", channelId);
            } else {
              channelAccessToken = item?.data().channelAccessToken;
            }
          } else {
            functions.logger.info("add", item.data());
            const { channelSecret } = JSON.parse(JSON.stringify(item?.data()));
            const channelId = item.id;
            functions.logger.info("updated", channelId, channelSecret);
            channelAccessToken = await getChannelAccessToken(
              channelId,
              channelSecret
            );
            updateLimitedChannelAccessToken(channelId, channelAccessToken);
            functions.logger.info(
              "channelId: %s updated",
              item.data().channelId
            );
          }
        } catch (e: any) {
          functions.logger.error("Occur Exception: %s", e);
        }
      });
    });
  });
