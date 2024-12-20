import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  autoGenerateUsername,
  createErrorResponse,
  createSuccussResponse,
  generateCode,
  generateToken,
  sendResetCodeEmail,
  sendVerificationEmail,
  validateBirthDate,
  validateEmail,
  validateLength,
  validatePassword,
} from "@/helpers";
import User from "@/models/user/User";
import { RegisterRequestBody, RequestWithUserId } from "@/types/types";
import Code from "@/models/code/Code";

export const register = async (
  req: Request<{}, {}, RegisterRequestBody>,
  res: Response
): Promise<Response> => {
  const {
    first_name,
    last_name,
    email,
    password,
    gender,
    birth_year,
    birth_month,
    birth_day,
  } = req.body;

  try {
    if (!validateEmail(email)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_EMAIL",
        "Invalid email format."
      );
    }

    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return createErrorResponse(
        res,
        400,
        "EMAIL_EXISTS",
        "Registration failed."
      );
    }

    if (!validateLength(first_name, 2, 30)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_FIRST_NAME",
        "First name must be between 2 and 30 characters."
      );
    }
    if (!validateLength(last_name, 2, 30)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_LAST_NAME",
        "Last name must be between 2 and 30 characters."
      );
    }

    if (!validatePassword(password)) {
      return createErrorResponse(
        res,
        400,
        "WEAK_PASSWORD",
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
    }

    if (!validateBirthDate(birth_year, birth_month, birth_day)) {
      return createErrorResponse(
        res,
        400,
        "INVALID_BIRTH_DATE",
        "Invalid birth date provided."
      );
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const username = await autoGenerateUsername(first_name, last_name);

    // Create new user and save
    const user = new User({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
      gender,
      birth_year,
      birth_month,
      birth_day,
    });
    await user.save();

    // Generate email verification token
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "2d"
    );
    const url = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    // Send email verification link to user
    sendVerificationEmail(user.email, user.first_name, url);

    // Generate JWT token and return user data
    const token = generateToken({ id: user._id.toString() }, "7d");
    const data = {
      token,
      user: {
        id: user._id,
        username: user.username,
        picture: user.picture,
        first_name: user.first_name,
        last_name: user.last_name,
        verified: user.verified || false,
        birth_year: user.birth_year,
        birth_month: user.birth_month,
        birth_day: user.birth_day
      },
    };
    return createSuccussResponse(
      res,
      201,
      "REGISTER_SUCCESS",
      "User registered successfully. Please verify your email.",
      data
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const verifyEmail = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  try {
    const validUserId = req.user?.id;
    const { token } = req.body;

    if (!token) {
      return createErrorResponse(
        res,
        400,
        "INVALID_ACCESS_TOKEN",
        " Activation token is missing."
      );
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JwtPayload;

    const userId = decodedToken.id;
    const user = await User.findById(userId);

    if (!user) {
      return createErrorResponse(
        res,
        404,
        "USER_NOT_FOUND",
        "Authenticated user not found."
      );
    }

    if (validUserId !== userId) {
      return createErrorResponse(
        res,
        403,
        "INVALID_ACCESS_TOKEN",
        "You don't have authorization to complete this operation."
      );
    }

    if (user.verified) {
      return createErrorResponse(
        res,
        400,
        "EMAIL_ALREADY_ACTIVATED",
        "This email is already activated."
      );
    }

    user.verified = true;
    await user.save();

    return createSuccussResponse(
      res,
      200,
      "EMAIL_ACTIVATION_SUCCESS",
      "Email has been successfully verified. You can now log in."
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;
    if (!validateEmail(email) || !password) {
      return createErrorResponse(
        res,
        400,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    }
    const user = await User.findOne({ email }).select("+password").exec();
    const hashedPassword = (user && user.password) || "";
    const passwordMatch = bcrypt.compareSync(password, hashedPassword);

    if (!user || !passwordMatch) {
      return createErrorResponse(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Invalid email or password."
      );
    }

    const isVerified = user?.verified;

    if (!isVerified) {
      return createErrorResponse(
        res,
        403,
        "EMAIL_NOT_VERIFIED",
        "Email address is not verified. Please check your email for the verification link."
      );
    }

    const token = generateToken({ id: user._id.toString() }, "7d"); //
    const data = {
      token,
      user: {
        id: user._id,
        username: user.username,
        picture: user.picture,
        first_name: user.first_name,
        last_name: user.last_name,
        verified: user.verified || false,
        birth_year: user.birth_year,
        birth_month: user.birth_month,
        birth_day: user.birth_day
      },
    };
    return createSuccussResponse(
      res,
      200,
      "LOGIN_SUCCESS",
      "Login successful.",
      data
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};
export const sendVerification = async (
  req: RequestWithUserId,
  res: Response
): Promise<Response> => {
  try {
    const id = req.user?.id;
    const user = await User.findById(id);
    if (!user) {
      return createErrorResponse(
        res,
        404,
        "USER_NOT_FOUND",
        "Authenticated user not found."
      );
    }

    if (user.verified === true) {
      return createErrorResponse(
        res,
        400,
        "EMAIL_ALREADY_ACTIVATED",
        "This email is already activated."
      );
    }

    // Generate email verification token
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "2d"
    );
    const url = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
    // Send email verification link to user
    sendVerificationEmail(user.email, user.first_name, url);
    return createSuccussResponse(
      res,
      200,
      "VERIFICATION_EMAIL_SENT",
      "Verification email has been sent to your registered email address."
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const sendResetPasswordCode = async (
  req: Request<{}, {}, { email: string }>,
  res: Response
): Promise<Response> => {
  const { email } = req.body;
  if (!validateEmail(email)) {
    return createErrorResponse(
      res,
      400,
      "INVALID_EMAIL",
      "Invalid email address."
    );
  }
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return createErrorResponse(
        res,
        404,
        "USER_NOT_FOUND",
        "User not found with this email address."
      );
    }
    await Code.findOneAndDelete({ user: user._id });
    const code = generateCode(5);
    const savedCode = await new Code({
      code,
      user: user._id,
    });
    savedCode.save();
    sendResetCodeEmail(user.email, user.first_name, code);
    return createSuccussResponse(
      res,
      200,
      "RESET_CODE_SUCCESS",
      "Reset code sent successfully. Please check your email."
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const validateResetCode = async (
  req: Request<{}, {}, { email: string; code: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return createErrorResponse(
        res,
        404,
        "USER_NOT_FOUND",
        "User not found with this email address."
      );
    }

    const userCode = await Code.findOne({ user: user._id });
    if (!userCode || userCode.code !== code) {
      return createErrorResponse(
        res,
        401,
        "INVALID_RESET_CODE",
        "Invalid reset code. Please check the code and try again."
      );
    }
    await Code.findOneAndDelete({ user: user._id });
    return createSuccussResponse(
      res,
      200,
      "RESET_CODE_VALIDATED",
      "Reset code has been validated successfully."
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};

export const changePassword = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return createErrorResponse(
        res,
        404,
        "USER_NOT_FOUND",
        "User not found with this email address."
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
      }
    );
    return createSuccussResponse(
      res,
      200,
      "PASSWORD_CHANGED",
      "Password changed successfully"
    );
  } catch (error: unknown) {
    const errorMessage =
      (error as Error).message ||
      "An unexpected error occurred. Please try again later.";
    return createErrorResponse(res, 500, "SERVER_ERROR", errorMessage);
  }
};
