import * as nodemailer from "nodemailer";
import { enableNotification } from "./notificationConfig";

const aws_key = process.env.AWS_SES_USER;
const aws_secret = process.env.AWS_SES_PASS;

export const sendMail = async (to, title, body) => {
  if (!enableNotification) {
    return ;
  }
  const mailOptions = {
    from: "おもちかえり.com <info@omochikaeri.com>",
    to,
    text: body,
    // html: html,
    subject: title,
  };
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
