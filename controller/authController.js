import prisma from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { loginScheme, schema } from "../validations/authValidations.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { sendEmail } from "../config/mailer.js";
import logger from "../config/logger.js";
import { emailQueue, emailQueueName } from "../jobs/EmailQueue.js";

class AuthController {
  static async register(req, res, next) {
    try {
      const body = req.body;
      const validator = vine.compile(schema);
      const payload = await validator.validate(body);

      // Encrypt the password

      const salt = bcrypt.genSaltSync(10);
      payload.password = bcrypt.hashSync(payload.password, salt);

      const email = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (email) {
        return res.status(300).json({
          success: false,
          messages: "Email already exists. Please try to login.",
        });
      }

      const newUser = await prisma.user.create({
        data: payload,
      });

      return res.status(200).json({
        success: true,
        message: "User created successfully",
        newUser,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          error: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Some Error Occured!! Please Try again later.",
        });
      }
    }
  }

  static async login(req, res, next) {
    try {
      const body = req.body;
      const validator = vine.compile(loginScheme);
      const payload = await validator.validate(body);

      const findUser = await prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!findUser) {
        return res.status(400).json({
          success: false,
          message:
            "Incorrect email id or email is not registered. Please register to login.",
        });
      }

      const hassedPassword = bcrypt.compareSync(
        payload.password,
        findUser.password
      );

      if (!hassedPassword) {
        return res.status(300).json({
          success: false,
          message: "Incorrect emailID or password",
        });
      }

      const payloadData = {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        profile: findUser.profile,
      };

      const token = jwt.sign(payloadData, process.env.JWT_SECRET, {
        expiresIn: "365d",
      });

      return res.status(200).json({
        success: true,
        message: "login Successfull",
        access_token: `Bearer ${token}`,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({
          success: false,
          error: error.messages,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Some Error Occured!! Please Try again later.",
        });
      }
    }
  }

  static async sendTestEmail(req, res, next) {
    try {
      const { email1, email2 } = req.query;

      const payload = [
        {
          toEmail: email1,
          subject: "Hey I am just testing",
          body: "<h1>Hello World , I am from Master backend series.</h1>",
        },
        {
          toEmail: email2,
          subject:
            "Hey I am just sending this email just to check the power of bullMQ",
          body: "<h1>BullMQ,BullMQ,BullMQ,BullMQ,BullMQ,BullMQ,BullMQ<h1>",
        },
      ];

      await emailQueue.add(emailQueueName, payload);
      return res.status(200).json({
        success: true,
        message: "Job added Successfully!!!",
      });
    } catch (error) {
      logger.error(error?.message);
      return res.status(500).json({
        success: false,
        message: "Some Internal server error occurred!!!",
      });
    }
  }
}

export default AuthController;
