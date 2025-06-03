import { Request, Response, NextFunction } from "express";
import userService from "../../service/users.js";
import { AuthStrategyFactory } from "../../utils/auth.js";

export default {
  hashing: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      res.status(204).json(await userService.hashing(email, password));
    } catch (err) {
      next(err);
    }
  },
  verifing: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      res.status(204).json(await userService.verifing(email, password));
    } catch (err) {
      next(err);
    }
  },
  generateToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res
        .status(200)
        .json({
          jwt: await userService.generateToken(req.body.email as string),
        });
    } catch (err) {
      next(err);
    }
  },
  success: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ message: "Success" });
    } catch (err) {
      next(err);
    }
  },
  redirectToProvider: (req: Request, res: Response, next: NextFunction) => {
    res.redirect(
      AuthStrategyFactory.createAuthStrategy(
        req.params.provider as string,
      ).getAuthUrl(),
    );
  },
  dataExchangeWithProvider: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const strategy = AuthStrategyFactory.createAuthStrategy(
      req.params.provider as string,
    );
    res
      .status(200)
      .json(await strategy.handleCallback(req.query.code as string));
  },
};
