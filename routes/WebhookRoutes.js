import express from "express";
import { WebhookController } from "../controllers/index.js";

const router = express.Router();

router.post("/on-comment", WebhookController.handleCommentWebhook);

export default router;
