import express from "express";
import { WebhookController } from "../controllers/index.js";

const router = express.Router();

router.post("/user-event", WebhookController.handleUserEventWebhook);

export default router;
