import { UserRole } from "../types/common.types";
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1d";

export const generateToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
};
