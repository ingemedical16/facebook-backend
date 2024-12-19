import { Response } from "express";
export const createErrorResponse = (res: Response, status: number, code: string, message: string) => {
    return res.status(status).json({ code, message });
  };

  export const createSuccussResponse = (res: Response, status: number, code: string, message: string,data?:Object) => {
    return res.status(status).json({ code, message,data });
  };