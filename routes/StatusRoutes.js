import express from "express";
import { StatusControllers } from "../controllers/index.js";

const router = express.Router();

router.post("/create", StatusControllers.createStatus);

export default router;
