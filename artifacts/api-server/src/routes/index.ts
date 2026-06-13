import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reportsRouter from "./reports";
import photosRouter from "./photos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(photosRouter);

export default router;
