import { Router, type IRouter, type RequestHandler } from "express";
import healthRouter from "./health";
import recipesRouter from "./recipes";
import authRouter from "./auth";
import substitutionsRouter from "./substitutions";

const router: IRouter = Router();

const requireAuth: RequestHandler = (req, res, next) => {
  if (req.session.authenticated === true) return next();
  res.status(401).json({ error: "Unauthorized" });
};

router.use(healthRouter);
router.use(authRouter);
router.use(requireAuth);
router.use(recipesRouter);
router.use(substitutionsRouter);

export default router;
