import jwt from "jsonwebtoken";

export const generateToken = (payload: object, expiresIn: string | number): string => {
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn }
    );
    return token;
};
