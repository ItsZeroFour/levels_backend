import express from "express";
import { UserControllers } from "../controllers/index.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post("/register", UserControllers.createUser);
router.get("/get", checkAuth, UserControllers.getUser);
router.patch("/increase-total-attempt", checkAuth, UserControllers.increaseTotalAttempt);
// router.patch('/increase-attempts', checkAuth, UserControllers.increaseDailyAttempts)
router.patch("/increase-rating", checkAuth, UserControllers.increaseRating);
router.get("/get-by-rating", UserControllers.getUsersByRating);

export default router;
