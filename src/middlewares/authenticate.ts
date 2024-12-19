import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

export const isAuthenticated = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7, authHeader.length)
      : "";

    if (!token) {
      res.status(401).json({ message: "Invalid Authentication" });
      return;
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET || "",
      (err, user: string | JwtPayload | undefined) => {
        if (err) {
          res.status(401).json({ message: "Invalid Authentication" });
          return;
        }
        req.user = user;
        next();
      }
    );
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || "Server Error";
    res.status(500).json({ message: errorMessage });
  }
};
