import express, { Router } from "express";
import * as uploadsController from "@/controllers/upload/upload";
import { isAuthenticated } from "@/middlewares/authenticate";
import fileParser from "@/middlewares/fileParser";
const router: Router = express.Router();

router.post(
  "/uploadFile",
  isAuthenticated,
  uploadsController.uploadFile
);
router.post(
  "/uploadFilesToCloud",
  fileParser,
  isAuthenticated,
  uploadsController.uploadFilesToCloud
);
router.post(
  "/listImages",
  isAuthenticated,
  uploadsController.searchImagesInCloud
);

export default router;
