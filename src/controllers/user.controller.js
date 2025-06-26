// controller is responsible for handling user-related requests
// bridge between routes and services

import asyncHandler from "../utils/asynchandler.js";


const registerUser = asyncHandler(async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "User registered successfully",
    });
}) 

export default registerUser;