import { Router } from "express";
import validate from "../middleware/controller-validation.js";
import userSchema from "../validations/schema/user.js";
import userController from "../controllers/users.js";
import tokenAuthentication from "../middleware/token-authentication.js";

const router = Router();

// endpoints for Hashing Password with BCrypt
router.post("/register", validate(userSchema.post), userController.hashing);
router.post("/login", validate(userSchema.post), userController.verifing);

// endpoints for JWT
// use 1st '/register'
router.post(
  "/jwt/login",
  validate(userSchema.post),
  userController.generateToken,
);
// on restrected endpoint, authenticate the token (send in header under 'authorization' param)
router.get("/jwt/restricted", tokenAuthentication, userController.success);

// endpoints for OAuth 2.0
router.get("/auth/:provider", userController.redirectToProvider);
router.get("/auth/:provider/callback", userController.dataExchangeWithProvider);

// google - to be able to use google, you have to set up an app in console.cloude.google.com
// github - only OAuth 2.0, not OpenID Connect, 2 ways:
// - OAuth Apps (long term, no expiration, used on apps "Sign in with ..")
// - GitHub Apps (short term, refresh token required, CI/CD, automation, etc.)
// discord - same as google
// facebook - same as google
// apple - i have to have Apple Developer account (be part of Apple Developer Program, which cost 99 USD/y)

export default router;
