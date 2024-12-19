import express, { Router } from "express";
import * as authController from "@/controllers/auth/auth";
import { isAuthenticated } from "@/middlewares/authenticate";
const router: Router = express.Router();

router.post("/register", authController.register);
router.post("/verify-email", isAuthenticated, authController.verifyEmail);
router.post("/login", authController.login);
router.post(
  "/sendVerification",
  isAuthenticated,
  authController.sendVerification
);
router.post("/sendResetPasswordCode", authController.sendResetPasswordCode);
router.post("/validateResetCode", authController.validateResetCode);
router.post("/changePassword", authController.changePassword);

export default router;
