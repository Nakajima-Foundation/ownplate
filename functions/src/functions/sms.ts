import * as AWS from 'aws-sdk';
import * as functions from 'firebase-functions'

const aws_key =  functions.config() && functions.config().aws &&  functions.config().aws.id || process.env.AWS_ID;
const aws_secret =  functions.config() && functions.config().aws &&  functions.config().aws.secret || process.env.AWS_SECRET;

if (aws_key) {
  AWS.config.update({
    region: 'us-east-1',
    credentials: new AWS.Credentials(
      aws_key,
      aws_secret,
    ),
  });
}
export const pushSMS = async (subject, message, phone_number) => {
  // send sms
  const params = {
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        "DataType": "String",
        "StringValue": "Promotional",
      },
      "AWS.SNS.SMS.SenderID": {
        "DataType": "String",
        // TODO: see config
        "StringValue": "omochikaeri",
      },
    },
    Subject: subject,
    Message: message,
    PhoneNumber: phone_number,
  };
  if (aws_key) {
    const aws = new AWS.SNS({apiVersion: '2010-03-31'})
    // @ts-ignore
    const publishTextPromise = await aws.publish(params).promise();
    if (!publishTextPromise) {
      console.log("ERROR");
    }
  } else {
    console.log("SMS not push")
  }
};
