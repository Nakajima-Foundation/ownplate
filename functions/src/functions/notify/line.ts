import * as netutils from "../../lib/netutils";
import { enableNotification } from "../notificationConfig";

export const sendMessageDirect = async (lineId: string, message: string, token: string) => {
  if (!enableNotification) {
    return;
  }
  if (!token) {
    console.log("no line message token");
    return;
  }
  return netutils.postJson(
    "https://api.line.me/v2/bot/message/push",
    {
      headers: {
        //Authorization: `Bearer ${data.access.access_token}`
        Authorization: `Bearer ${token}`,
      },
    },
    {
      to: lineId,
      messages: [{ type: "text", text: message }],
    },
  );
};
