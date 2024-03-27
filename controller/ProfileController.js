import prisma from "../db/db.config.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong!!!",
      });
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const authUser = req.user;

      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: "please select a file item",
        });
      }
      const profile = req.files.profile;
      const message = imageValidator(profile?.size, profile.mimetype);

      if (message !== null) {
        return res.status(400).json({
          error: message,
        });
      }

      const imgExt = profile?.name.split(".");

      const imageName = generateRandomNum() + "." + imgExt[1];

      const uploadPath = process.cwd() + "/public/images/" + imageName;

      profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          profile: imageName,
        },
      });

      return res.status(200).json({
        message: "Profile update successfully",
      });
    } catch (error) {
        res.status(300).json({
            success: false,
            message: "Internal Server Error"
        })
    }
  }

  static async destroy() {}

  static async store() {}

  static async show() {}
}

export default ProfileController;
