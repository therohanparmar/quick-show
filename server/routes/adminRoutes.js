import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import { getAllShows, getDashboardData, isAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get('/is-admin', protectAdmin, isAdmin);
adminRouter.get('/dashboard', protectAdmin, getDashboardData);
adminRouter.get('/all-shows', protectAdmin, getAllShows);
adminRouter.get('/is-bookings', protectAdmin, getAllShows);

export default adminRouter;