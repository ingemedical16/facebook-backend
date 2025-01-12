import express, { Router } from "express";
import { isAuthenticated } from "@/middlewares/authenticate";
import * as chatController from "@/controllers/chat/chat"
const router: Router = express.Router();

router.use(isAuthenticated);

// Create private chat
router.post("/private", chatController.createPrivateChat);

// Send a message
router.post("/:chatId/message", chatController.sendMessage);

// Add a member to chat
router.post("/:chatId/member", chatController.addMemberToChat);

// Remove a member from chat
router.delete("/:chatId/member", chatController.removeMemberFromChat);

// Get chat details
router.get("/:chatId", chatController.getChatDetails);


export default router;