import nodemailer from "nodemailer";
import logger from "./logger.js";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (toMail, subject, body) => {
  const info = await transporter.sendMail({
    from: process.env.FROM_USER, // sender address
    to: toMail, // list of receivers
    subject: subject, // Subject line
    html: body, // html body
  });

  logger.info(info.response)
};