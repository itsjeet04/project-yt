import {asyncHandler} from "../utils/asynchandler.js";


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "User registered successfully",
    });
}) 

export default registerUser;