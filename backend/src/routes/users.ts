// src/routes/user.ts

import express, { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  sendVerification,
  searchUserByEmail,
  sendResetPasswordCode,
  validateResetCode,
  changePassword,
} from "../controllers/user/user";
import { isAuthenticated } from "../middlewares/authenticate";

const router: Router = express.Router();

router.post("/register", register);
router.post("/verify-email", isAuthenticated, verifyEmail);
router.post("/sendVerification", isAuthenticated, sendVerification);
router.post("/search-user", searchUserByEmail);
router.post("/login", login);
router.post("/sendResetPasswordCode", sendResetPasswordCode);
router.post("/validateResetCode", validateResetCode);
router.post("/changePassword", changePassword);

export default router;
