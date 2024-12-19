import nodemailer, { SendMailOptions } from "nodemailer";
import { google, Auth } from "googleapis";
import dotenv from "dotenv";
dotenv.config();
const OAuth2 = google.auth.OAuth2;
const {
  MAILING_EMAIL,
  MAILING_CLIENT_ID,
  MAILING_CLIENT_SECRET,
  MAILING_REDIRECT_URI,
  MAILING_REFRESH,
} = process.env;

// Ensure environment variables are defined
if (
  !MAILING_EMAIL ||
  !MAILING_CLIENT_ID ||
  !MAILING_CLIENT_SECRET ||
  !MAILING_REDIRECT_URI ||
  !MAILING_REFRESH
) {
  throw new Error("Missing required environment variables for mailing.");
}

const auth: Auth.OAuth2Client = new OAuth2(
  MAILING_CLIENT_ID,
  MAILING_CLIENT_SECRET,
  MAILING_REDIRECT_URI
);

export const sendVerificationEmail = async (
  email: string,
  name: string,
  url: string
): Promise<void> => {
  auth.setCredentials({ refresh_token: MAILING_REFRESH });

  const accessToken = await auth.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: MAILING_EMAIL,
      clientId: MAILING_CLIENT_ID,
      clientSecret: MAILING_CLIENT_SECRET,
      refreshToken: MAILING_REFRESH,
      accessToken: accessToken.token || "", // TypeScript requires a string, so provide fallback
    },
  });

  const mailOptions: SendMailOptions = {
    from: MAILING_EMAIL,
    to: email,
    subject: "Facebook Verification",
    html: `
      <div style="
      max-width:700px;
      margin-bottom:1rem;
      display:flex;
      align-items:center;
      gap:10px;
      font-family:Roboto;
      font-weight:600;
      color:#3b5998">

        <img src="https://res.cloudinary.com/dxos5na7j/image/upload/v1731175299/assets/images/enf27tzgnswdjocl8m5w.png" alt="logo" style="width:30px">
        <span>Action requise : Activate your facebook account</span>
      </div>
      <div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto">
        <span>Hello ${name}</span>
        <div style="padding:20px 0">
            <span style="padding:1.5rem 0">You recently created an account on Facebook. To complete your registration, please confirm your account.</span>
        </div>
        <a href=${url} style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Confirm your account</a>
        <br>
        <div style="padding-top:20px">
            <span style="margin:1.5rem 0;color:#898f9c">Facebook allows you to stay in touch with all your friends, once refistered on facebook,you can share photos,organize events and much more.</span>
        </div>
        </div>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export const sendResetCode = async (
  email: string,
  name: string,
  code: string
) => {
  auth.setCredentials({ refresh_token: MAILING_REFRESH });

  const accessToken = await auth.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: MAILING_EMAIL,
      clientId: MAILING_CLIENT_ID,
      clientSecret: MAILING_CLIENT_SECRET,
      refreshToken: MAILING_REFRESH,
      accessToken: accessToken.token || "", // TypeScript requires a string, so provide fallback
    },
  });
  const mailOptions = {
    from: MAILING_EMAIL,
    to: email,
    subject: "Reset facebook password",
    html: `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/dmhcnhtng/image/upload/v1645134414/logo_cs1si5.png" alt="" style="width:30px"><span>Action requise : Activate your facebook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently created an account on Facebook. To complete your registration, please confirm your account.</span></div><a  style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">${code}</a><br><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Facebook allows you to stay in touch with all your friends, once refistered on facebook,you can share photos,organize events and much more.</span></div></div>`,
  };
  // Send the email
  await transporter.sendMail(mailOptions);
};
