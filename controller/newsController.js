import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/newsValidation.js";
import { imageValidator, generateRandomNum, removeImage } from "../utils/helper.js";
import prisma from "../db/db.config.js";
import NewsAPITranform from "../transform/newsAPItransform.js";
import redisCache from "../db/redis.config.js";
import logger from "../config/logger.js";

class NewsController {
  static async index(req, res, next) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page <= 0) {
      page = 1;
    }

    if (limit <= 0 || limit >= 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;
    const news = await prisma.news.findMany({
      skip: skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });

    const newsTransform = news?.map((elem) => NewsAPITranform.transform(elem));

    const totalPages = await prisma.news.count();
    const totalNews = Math.ceil(totalPages / limit);

    if (!news) {
      return res.status(200).json({
        success: false,
        message: "No news are present in the database",
      });
    }

    return res.status(200).json({
      success: true,
      news: newsTransform,
      metadata: {
        totalNews,
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
  }

  static async store(req, res, next) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please a file",
        });
      }

      const image = req.files?.image;
      const message = imageValidator(image?.size, image.mimetype);

      if (message !== null) {
        return res.status(400).json({
          error: message,
        });
      }

      const imgExt = image?.name.split(".");
      const imageName = generateRandomNum() + "." + imgExt[1];
      const uploadPath = process.cwd() + "/public/newsImages/" + imageName;

      image.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      payload.user_id = user.id;
      payload.image = imageName;

      const newNews = await prisma.news.create({
        data: payload,
      });

      redisCache.del("/api/news", (err) => {
        if (err) throw err;
      });

      return res.status(200).json({
        success: true,
        newNews, 
      });
    } catch (error) {
        logger.error(error?.message);
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

  static async show(req, res, next) {
    const { id } = req.params;
    console.log(id);
    const news = await prisma.news.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      news: NewsAPITranform.transform(news),
    });
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;

      const news = await prisma.news.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (user.id !== news.user_id) {
        return res.status(400).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      const image = req?.files?.image;

      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null) {
          return res.status(400).json({
            success: false,
            error: message,
          });
        }

        console.log(message)

        const imgExt = image?.name.split(".");
        const imageName = generateRandomNum() + "." + imgExt[1];
        const uploadPath = process.cwd() + "/public/newsImages/" + imageName;

        image.mv(uploadPath, (err) => {
          if (err) throw err;
        });
        console.log(imageName)
        payload.image = imageName;

        removeImage(news.image);
      }

      await prisma.news.update({
        where: {
          id: Number(id),
        },
        data: payload,
      });

      return res.status(200).json({
        success: true,
        message: "News Updated Successfully.",
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

  static async destroy(req, res, next) {
    try {
        const { id } = req.params;
        const user = req.user;
        const news = await prisma.news.findUnique({
          where: {
            id: Number(id),
          },
        });
        if (user.id !== news?.user_id) {
          return res.status(401).json({ message: "Un Authorized" });
        }
  
        // * Delete image from filesystem
        removeImage(news.image);
        await prisma.news.delete({
          where: {
            id: Number(id),
          },
        });
        return res.json({ message: "News deleted successfully!" });
      } catch (error) {
        return res.status(500).json({
          status: 500,
          message: "Something went wrong.Please try again.",
        });
      }
    }
}

export default NewsController;
