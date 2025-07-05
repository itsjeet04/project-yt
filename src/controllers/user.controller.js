// controller is responsible for handling user-related requests
// bridge between routes and services

import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";

const genrateAccessandRefreshTokens = async(userId) =>{
   try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // validateBeforeSave: false is used to skip validation for the refreshToken field,dont want to validate it again
    return {
      accessToken,
      refreshToken
    };
   } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Internal server error while generating tokens");
   }
}

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  // console.log("Request body:", req.body);
  

  if ([username, fullName, email, password].some(field => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

  // console.log("Avatar local path:", avatarLocalPath);


  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath); //if coverImageLocalPath is empty, it will return empty string
  // console.log("Avatar upload response:", avatar);


  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  res.status(201).json(
    new ApiResponse(201, createdUser, "User created successfully")
  );
});

const loginUser = asyncHandler(async (req,res) => {
  const { email , username, password  } = req.body;
  // console.log("Login request body:", req.body);
  if (!email && !username) {
    throw new ApiError(400, "Email or username are required");
  }

const user = await User.findOne({
  $or: [{ email }, { username }]
}).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
    throw new ApiError(401, "password is incorrect");
  }

  const {accessToken,refreshToken} = await genrateAccessandRefreshTokens(user._id)

  const LoggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  
  const options= {
    httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    secure : false}
 return res.status(200).cookie("accessToken", accessToken,options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,{
      user: LoggedInUser,accessToken, refreshToken
    }, "User logged in successfully")
    );


}) 


const logoutUser = asyncHandler(async (req, res) => {
  // clear the cookies
  // reset the refresh token in the database
  await User.findByIdAndUpdate(req.user._id,
    {
      $set : { 
            refreshToken: undefined
      }
    },
    {
      new: true,
    }
  ) 
  const options= {
    httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    secure : true}

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully"));
})



export {
   registerUser,
   loginUser,
   logoutUser
  };        