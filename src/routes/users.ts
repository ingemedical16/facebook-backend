// src/routes/user.ts

import express, { Router } from "express";
import * as userController from "@/controllers/user/user";
import { isAuthenticated } from "@/middlewares/authenticate";

const router: Router = express.Router();


router.post("/search-user", userController.searchUserByEmail);
router.post("/search/:searchTerm", isAuthenticated, userController.search);
router.put(
  "/addToSearchHistory",
  isAuthenticated,
  userController.addToSearchHistory
);
router.get(
  "/getSearchHistory",
  isAuthenticated,
  userController.getSearchHistory
);
router.put(
  "/removeFromSearchHistory",
  isAuthenticated,
  userController.removeFromSearchHistory
);
router.get("/getProfile/:username", isAuthenticated, userController.getProfile);
router.put(
  "/updateProfilePicture",
  isAuthenticated,
  userController.updateProfilePicture
);
router.put("/updateCover", isAuthenticated, userController.updateCover);
router.put("/updateDetails", isAuthenticated, userController.updateDetails);
router.put("/addFriend/:id", isAuthenticated, userController.addFriend);
router.put("/acceptRequest/:id", isAuthenticated, userController.acceptRequest);
router.put("/cancelRequest/:id", isAuthenticated, userController.cancelRequest);

router.put("/follow/:id", isAuthenticated, userController.follow);
router.put("/unfollow/:id", isAuthenticated, userController.unfollow);
router.put("/unfriend/:id", isAuthenticated, userController.unfriend);
router.put("/deleteRequest/:id", isAuthenticated, userController.deleteRequest);
router.get(
  "/getFriendsPageInfos",
  isAuthenticated,
  userController.getFriendsPageInfos
);

export default router;
