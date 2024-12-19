import express, { Router } from "express";
import * as reactionController from "@/controllers/reaction/reaction";
import { isAuthenticated } from "@/middlewares/authenticate";

const router: Router = express.Router();

router.put(
  "/put-reaction",
  isAuthenticated,
  reactionController.handlePostReactionsByPostId
);
router.get(
  "/getPostReactions/:id",
  isAuthenticated,
  reactionController.getReactions
);

export default router;
