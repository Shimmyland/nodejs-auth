import env from "../../config/default.js";
import jwt from "jsonwebtoken";

export default async (req: any, res: any, next: any) => {
  const JWT_SECRET = env.JWT_SECRET;
  if (!JWT_SECRET)
    return res.status(500).json({ message: "JWT_SECRET is not defined" });

  if (!req.headers.authorization)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  next();
};
