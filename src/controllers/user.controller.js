// controller is responsible for handling user-related requests
// bridge between routes and services

import asyncHandler from "../utils/asynchandler.js";
import {ApiError}  from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
//    get user data from frontend/postman
//    validate data
//    check if user already exists
//    check for image , avtaar
//    upload image to cloudinary
//    create user object in database
//    remove password and refresh token from response
//    check if user is created successfully
//    send response to frontend/postman
      
    const {username,fullName,email,password} = req.body 
    // destructuring data from request body
    // form ,json data will be in req.body , url data will not be here but in req.query
    
    // testing 
    console.log("User data received:", {username,fullName,email,password});    

    if (!username || !fullName || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    //   if (
    //     [fullName, email, username, password].some((field) => field?.trim() === "")
    // ) {
    //     throw new ApiError(400, "All fields are required")
    // }
    
    // check if user already exists
    const existingUser = await User.find ({
    $or: [{ username }, { email }] });
    // $or operator is used to check if either username or email already exists

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverimage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }

    // upload avatar image to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await coverImage(coverImageLocalPath)

    // avtar is required for user registration, so if it fails, we throw an error
    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }
        
    // create user object in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
  
    // remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }
    
    // send response to frontend/postman
    res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    );

        
}) 

export { registerUser };        