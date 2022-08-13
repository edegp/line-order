import axios from "axios";
import { format } from "date-fns";
import { addDays } from "date-fns";
// eslint-disable-next-line import/namespace
import { f } from "./index";
import { ChannelAccessToken } from "./common/utils";
import * as functions from "firebase-functions";

export const updateLineAccessToken = f.https.onRequest(async (req, res) => {
  const updateLimitedChannelAccessToken = (
    channelId: any,
    channelAccessToken: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>
  ) => {
    const now = new Date();
    const limitDate = format(addDays(now, 20), "yyyy-MM-dd HH:mm:ssz");

    ChannelAccessToken.where("channelId", "==", channelId)
      .limit(1)
      .get()
      .then((q) =>
        ChannelAccessToken.doc(q.docs[0].ref.path).update({
          channelAccessToken,
          limitDate,
        })
      );
  };

  const getChannelAccessToken = async (channelId: any, channelSecret: any) => {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const body = {
      grantYype: "clientCredentials",
      clientId: channelId,
      clientSecret: channelSecret,
    };

    const response: any = await axios.post(
      process.env.API_ACCESSTOKEN_URL || "",
      {
        headers: headers,
        data: body,
      }
    );
    functions.logger.debug("new_channel_access_token %s", response.text);
    const resBody = JSON.parse(response.text);

    return resBody.accessToken;
  };
  ChannelAccessToken.get().then((q) =>
    q.forEach(async (item) => {
      try {
        let channelAccessToken;
        if (item.data().channelAccessToken) {
          const limitDate = new Date(item.data().limitDate);
          const now = new Date();
          if (limitDate < now) {
            channelAccessToken = await getChannelAccessToken(
              item.data().channelId,
              item.data().channelSecret
            );
            updateLimitedChannelAccessToken(
              item.data().channelId,
              channelAccessToken
            );
            functions.logger.info(
              "channelId: %s updated",
              item.data().channelId
            );
          } else {
            channelAccessToken = item.data().channelAccessToken;
          }
        } else {
          channelAccessToken = await getChannelAccessToken(
            item.data().channelId,
            item.data().channelSecret
          );
          updateLimitedChannelAccessToken(
            item.data().channelId,
            channelAccessToken
          );
          functions.logger.info("channelId: %s updated", item.data().channelId);
        }
      } catch (e) {
        functions.logger.error("Occur Exception: %s", e);
      }
    })
  );
});
