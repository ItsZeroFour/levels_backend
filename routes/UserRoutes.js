import express from "express";
import { UserControllers } from "../controllers/index.js";

const router = express.Router();

router.post("/register", UserControllers.createUser);

export default router;
