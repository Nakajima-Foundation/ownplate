import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { enableNotification } from "./notificationConfig";

const aws_key = process.env.AWS_ID ?? "";
const aws_secret = process.env.AWS_SECRET ?? "";

export const pushSMS = async (subject, message, phone_number) => {
  if (!enableNotification) {
    return;
  }

  const params = {
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Promotional",
      },
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: "omochikaeri",
      },
    },
    Subject: subject,
    Message: message,
    PhoneNumber: phone_number,
  };

  if (aws_key) {
    const snsClient = new SNSClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: aws_key,
        secretAccessKey: aws_secret,
      },
    });

    try {
      const command = new PublishCommand(params);
      const response = await snsClient.send(command);
      console.log(response);
    } catch (error) {
      console.error("ERROR", error);
    }
  } else {
    console.log("SMS not pushed");
  }
};
