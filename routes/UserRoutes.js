import express from "express";
import { UserControllers } from "../controllers/index.js";
import checkAuth from "../utils/checkAuth.js";
import { detectDevice } from "../utils/deviceDetector.js";

const router = express.Router();

router.post("/register", UserControllers.createUser);
router.get("/get", checkAuth, UserControllers.getUser);
router.patch("/check-limit", checkAuth, UserControllers.checkLimit);
router.patch("/increase-rating", checkAuth, UserControllers.increaseRating);
router.get("/get-by-rating", UserControllers.getUsersByRating);
router.get("/abilities", UserControllers.getUserAbilities);
router.post("/abilities/use-extra-time", checkAuth, UserControllers.useExtraTimeAbility);
router.post("/abilities/use-skip-level", checkAuth, UserControllers.useSkipLevelAbility);
router.post("/promo-code", checkAuth, detectDevice, UserControllers.getPromoCodeLink);

export default router;
