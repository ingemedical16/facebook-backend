import nodemailer, { SendMailOptions } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport"; // Import SMTPTransport type
import { google, Auth } from "googleapis";
import dotenv from "dotenv";
import { resetCodeTemplate, verificationTemplate } from "./email_template";

dotenv.config();

const OAuth2 = google.auth.OAuth2;

// Load environment variables
const {
  MAILING_EMAIL,
  MAILING_CLIENT_ID,
  MAILING_CLIENT_SECRET,
  MAILING_REDIRECT_URI,
  MAILING_REFRESH,
} = process.env;

if (
  !MAILING_EMAIL ||
  !MAILING_CLIENT_ID ||
  !MAILING_CLIENT_SECRET ||
  !MAILING_REDIRECT_URI ||
  !MAILING_REFRESH
) {
  throw new Error("Missing required environment variables for mailing.");
}

// Create OAuth2 client
const createOAuth2Client = (): Auth.OAuth2Client => {
  const auth = new google.auth.OAuth2(
    MAILING_CLIENT_ID,
    MAILING_CLIENT_SECRET,
    MAILING_REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: MAILING_REFRESH });
  return auth;
};

// Generate access token
const getAccessToken = async (auth: Auth.OAuth2Client): Promise<string> => {
  const accessTokenResponse = await auth.getAccessToken();
  if (!accessTokenResponse.token) {
    throw new Error("Failed to generate access token.");
  }

  return accessTokenResponse.token;
};

// Create mail transporter
const createTransporter = async (): Promise<nodemailer.Transporter> => {
  const auth = createOAuth2Client();
  const accessToken = await getAccessToken(auth);

  const transportOptions: SMTPTransport.Options = {
    service: "gmail", // Define service for Gmail
    auth: {
      type: "OAuth2",
      user: MAILING_EMAIL,
      clientId: MAILING_CLIENT_ID,
      clientSecret: MAILING_CLIENT_SECRET,
      refreshToken: MAILING_REFRESH,
      accessToken,
    },
  };

  return nodemailer.createTransport(transportOptions);
};

// Send email
const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    const transporter = await createTransporter();
    const mailOptions: SendMailOptions = {
      from: MAILING_EMAIL,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error: any) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

// Public functions
export const sendVerificationEmail = async (
  email: string,
  name: string,
  url: string
): Promise<void> => {
  const html = verificationTemplate(name, url);
  await sendEmail(email, "Facebook Verification", html);
};

export const sendResetCodeEmail = async (
  email: string,
  name: string,
  code: string
): Promise<void> => {
  const html = resetCodeTemplate(name, code);
  await sendEmail(email, "Reset Facebook Password", html);
};
