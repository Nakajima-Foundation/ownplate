import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer';

const aws_key =  functions.config() && functions.config().aws &&  functions.config().aws.ses_user || process.env.AWS_SES_USER;
const aws_secret =  functions.config() && functions.config().aws &&  functions.config().aws.ses_pass || process.env.AWS_SES_PASS;

export const sendMail = async (to, title, body) => {
  const mailOptions = {
    from: 'omochikaeri <info@omochikaeri.com>',
    to,
    text: body,
    // html: html,
    subject: title,
  };
  if (aws_key && aws_secret) {
    const smtpTransporter = nodemailer.createTransport({
      port: 465,
      host: 'email-smtp.ap-northeast-1.amazonaws.com',
      secure: true,
      auth: {
        user: aws_key,
        pass: aws_secret,
      },
      debug: true
    });
    await smtpTransporter.sendMail(mailOptions);
  } else {
    console.log("no aws smtp config");
    console.log(mailOptions);
  }
};
