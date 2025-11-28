import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { defineSecret } from "firebase-functions/params";
import { enableNotification } from "../notificationConfig";

const secret_aws_key = defineSecret("AWS_ID");
const secret_aws_secret = defineSecret("AWS_SECRET");

export const pushSMS = async (subject: string, message: string, phone_number: string) => {
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

  const aws_key =  secret_aws_key.value();
  const aws_secret = secret_aws_secret.value();
  if (aws_key && aws_secret) {
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
