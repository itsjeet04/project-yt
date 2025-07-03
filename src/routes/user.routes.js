import { Router } from "express";
import {loginUser, logoutUser, registerUser} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";
import { verify } from "jsonwebtoken";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
// user routes

router.route("/register").post(
    // file upload middleware
    upload.fields([
        { name: "avatar", maxCount: 1 }, // single file for avtar
        { name: "coverImage", maxCount: 1 } // single file for cover image
    ]),
    // register user controller
    registerUser)

router.route("/login").post(
    loginUser
)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;