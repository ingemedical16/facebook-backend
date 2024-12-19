import formidable, { File, Fields } from "formidable";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { createErrorResponse } from "@/helpers";

// Extend Request type to include files
declare global {
  namespace Express {
    interface Request {
      files?: Record<string, File | File[]>;
    }
  }
}

const fileParser: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const form = formidable();

  form.parse(req, (err, fields: formidable.Fields, files: formidable.Files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return createErrorResponse(
        res,
        400,
        "FORM_PARSE_ERROR",
        "Failure parsing form"
      );
    }

    // Assign fields to req.body
    if (!req.body) req.body = {};
    Object.entries(fields).forEach(([key, value]) => {
      req.body[key] = Array.isArray(value) ? value[0] : value;
    });

    // Assign files to req.files
    req.files = files as Record<string, File | File[]>;

    next();
  });
};

export default fileParser;
