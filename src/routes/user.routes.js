import { Router } from "express";
import {loginUser, logoutUser, registerUser,refreshAccessToken, changeCurrentPassword} from "../controllers/user.controller.js";
import {upload} from "../middleware/multer.middleware.js";
// import { verify } from "jsonwebtoken";
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
// middleware to verify JWT token
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;