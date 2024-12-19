import express, { Router } from "express";
import * as postController from "@/controllers/post/post";
import { isAuthenticated } from "@/middlewares/authenticate";

const router: Router = express.Router();

router.post("/createPost", isAuthenticated, postController.createPost);
router.get("/getAllPosts", isAuthenticated, postController.getAllPosts);
router.put("/comment", isAuthenticated, postController.comment);
router.put("/savePost/:id", isAuthenticated, postController.savePost);
router.delete("/deletePost/:id", isAuthenticated, postController.deletePost);

export default router;
