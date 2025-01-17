import { Request } from "express";
export interface FriendshipStatus {
  friends: boolean;
  following: boolean;
  requestSent: boolean;
  requestReceived: boolean;
}

export interface RegisterRequestBody {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  gender: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
}
// Define the expected request body type for verifyEmail
export interface VerifyEmailRequestBody {
  token: string;
}
export interface RequestWithUserId<
  Params = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
  Locals extends Record<string, any> = Record<string, any>
> extends Request<Params, ResBody, ReqBody, ReqQuery, Locals> {
  user?: { id: string }; // Add the custom `user` property
}

export type SearchApiResource = {
  public_id: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
  secure_url: string;
  url: string;
  [key: string]: any; // Allow additional fields for flexibility
};

export type SearchApiResponse = {
  resources: SearchApiResource[];
  total_count: number;
  time: number;
};

export interface ResponseData<T = any> {
  message: string;
  code: string;
  data?: T;
  
}

