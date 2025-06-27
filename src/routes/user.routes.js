import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
const router = Router();
// user routes

router.route("/register").post(registerUser)

export default router;