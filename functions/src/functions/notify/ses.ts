import * as nodemailer from "nodemailer";
import { defineSecret } from "firebase-functions/params";
import { enableNotification } from "../notificationConfig";

const secret_aws_key = defineSecret("AWS_SES_USER");
const secret_aws_secret = defineSecret("AWS_SES_PASS");

export const sendMail = async (to, title, body) => {
  if (!enableNotification) {
    return;
  }
  const mailOptions = {
    from: "おもちかえり.com <info@omochikaeri.com>",
    to,
    text: body,
    // html: html,
    subject: title,
  };
  const aws_key = secret_aws_key.value();
  const aws_secret = secret_aws_secret.value();
  if (aws_key && aws_secret) {
    const smtpTransporter = nodemailer.createTransport({
      port: 465,
      host: "email-smtp.ap-northeast-1.amazonaws.com",
      secure: true,
      auth: {
        user: aws_key,
        pass: aws_secret,
      },
      debug: true,
    });
    return await smtpTransporter.sendMail(mailOptions);
  } else {
    console.log("no aws smtp config");
    console.log(mailOptions);
  }
};
