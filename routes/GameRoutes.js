import express from "express";
import { GameControllers } from "../controllers/index.js";
import checkAuth from "../utils/checkAuth.js";

const router = express.Router();

router.post("/level-create", checkAuth, GameControllers.createLevel);
router.get("/get-puzzel/:level", checkAuth, GameControllers.getPuzzleByLevel);
router.patch("/start", checkAuth, GameControllers.startGame);

export default router;
