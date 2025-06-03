//import userRepo from '../database/repositories/user.js'
import bcrypt from "bcrypt";
import { logger } from "../utils/logger.js";
import { CustomError } from "../utils/errors.js";
import jwt from "jsonwebtoken";
import env from "../config/default.js";

// src/models/user.ts
export interface User {
  id: number;
  email: string;
  hash: string;
}

// Mocking database for demonstration purposes
export const users: User[] = [];

let db: Array<User> = [];

export default {
  hashing: async (email: string, password: string): Promise<void> => {
    const hash = await bcrypt.hash(password, 10); // password, salt 10 (10x times)
    logger.info(`Hashed password: ${hash}`);
    const id = db.length + 1;
    db.push({ id, email, hash });
  },
  verifing: async (email: string, password: string): Promise<void> => {
    const user = db.find((user) => user.email === email);
    if (!user) throw new CustomError(`User with ${email} not found.`, 404);
    const match = await bcrypt.compare(password, user.hash);
    if (!match) throw new CustomError(`Password is incorrect.`, 401);
    logger.info(`Password match`);
  },
  generateToken: async (email: string): Promise<string> => {
    if (!env.JWT_SECRET)
      throw new CustomError("JWT_SECRET is not defined", 500);
    return jwt.sign({ email }, env.JWT_SECRET, { expiresIn: "1h" });
  },
};
