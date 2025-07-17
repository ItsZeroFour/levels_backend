import express from "express";
import { UserControllers } from "../controllers/index.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post("/register", UserControllers.createUser);
router.get("/get", checkAuth, UserControllers.getUser);
router.patch("/check-limit", checkAuth, UserControllers.checkLimit);
// router.patch('/increase-attempts', checkAuth, UserControllers.increaseDailyAttempts)
router.patch("/increase-rating", checkAuth, UserControllers.increaseRating);
router.get("/get-by-rating", UserControllers.getUsersByRating);
router.get("/abilities", UserControllers.getUserAbilities);
router.post("/abilities/use-extra-time", checkAuth, UserControllers.useExtraTimeAbility);
router.post("/abilities/use-skip-level", checkAuth, UserControllers.useSkipLevelAbility);

export default router;
