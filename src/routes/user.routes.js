import { Router } from "express";
import registerUser from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";

const router = Router();
// user routes

router.route("/register").post(
    // file upload middleware
    upload.fields([
        { name: "avtar", maxCount: 1 }, // single file for avtar
        { name: "coverimage", maxCount: 1 } // single file for cover image
    ]),
    // register user controller
    registerUser)

export default router;