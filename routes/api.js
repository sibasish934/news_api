import { Router } from "express";
import AuthController from "../controller/authController.js";
import ProfileController from "../controller/ProfileController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import NewsController from "../controller/newsController.js";
import redisCache from "../db/redis.config.js";

const router = Router();

router.post('/auth/register', AuthController.register);
router.post("/auth/login", AuthController.login)

///profile routes

router.get("/profile", authMiddleware, ProfileController.index);
router.put("/profile/:id", authMiddleware, ProfileController.update);

//news routes

router.post("/news",redisCache.route(),authMiddleware, NewsController.store)
router.get("/news", redisCache.route(), authMiddleware, NewsController.index)
router.get("/news/:id", authMiddleware, NewsController.show)
router.put("/news/:id", authMiddleware, NewsController.update)
router.delete("/news/:id", authMiddleware, NewsController.destroy) 


router.get("/send-email", AuthController.sendTestEmail)

 
export default router;