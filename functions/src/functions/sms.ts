import * as AWS from "aws-sdk";

export const pushSMS = async (aws_key, aws_secret, subject, message, phone_number, isMo) => {
  // send sms
  const params = {
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        DataType: "String",
        StringValue: "Promotional",
      },
      "AWS.SNS.SMS.SenderID": {
        DataType: "String",
        StringValue: isMo ? "mobileorder" : "omochikaeri",
      },
    },
    Subject: subject,
    Message: message,
    PhoneNumber: phone_number,
  };
  if (aws_key) {
    const aws = new AWS.SNS({
      apiVersion: "2010-03-31",
      region: isMo ? "ap-northeast-1" : "us-east-1",
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
