import * as AWS from "aws-sdk";

export const pushSMS = async (aws_key, aws_secret, subject, message, phone_number) => {
  // send sms
  const params = {
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Promotional",
      },
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        // TODO: see config
        StringValue: "omochikaeri",
      },
    },
    Subject: subject,
    Message: message,
    PhoneNumber: phone_number,
  };
  if (aws_key) {
    const aws = new AWS.SNS({
      apiVersion: "2010-03-31",
      region: "us-east-1",
      credentials: new AWS.Credentials(aws_key, aws_secret),
    });
    // @ts-ignore
    const publishTextPromise = await aws.publish(params).promise();
    if (!publishTextPromise) {
      console.log("ERROR");
    }
    console.log(publishTextPromise);
  } else {
    console.log("SMS not push");
  }
};
