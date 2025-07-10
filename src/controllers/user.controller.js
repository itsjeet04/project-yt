// controller is responsible for handling user-related requests
// bridge between routes and services

import asyncHandler from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

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
  });

const refreshAccessToken = asyncHandler(async(req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  console.log("Incoming refresh token:", incomingRefreshToken);
  
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token not received");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
    const user = await User.findById(decodedToken?._id);
    if (!user){
      throw new ApiError(404, "User not found");
    }
  
    if(incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token expired, please login again");
    }
  
    options = {
    httpOnly: true, // prevents client-side JavaScript from accessing the cookie
    secure : true}
  
    const { accessToken, newRefreshToken } = await genrateAccessandRefreshTokens(user._id);
    return res.status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, { accessToken,  refreshToken: newRefreshToken },"Access token refreshed successfully"));
  } catch (error) {
    throw new ApiError(500, "Error refreshing access token");
  }
});


const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  const user = await User.findById(req.user._id)
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "password entered is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false })

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
  
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email} = req.body;

  if( !fullName || !email) {
    throw new ApiError(400, "Full name or email are required");
  }

  const user = await User.findById(req.user._id,
    {
      $set: {
        fullName : fullName,
        email: email,
    },   //aggregation pipeline to update only the fields that are provided
   },
    {new:true} // new:true returns the updated user
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, user, "User details updated successfully"));

})

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Failed to upload avatar image");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    { new: true }
  ).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, user, "User avatar updated successfully"));
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.files?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image is required");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Failed to upload cover image");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    { new: true }
  ).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, user, "User cover image updated successfully"));
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const {username} = req.params;
  // req.params is used to get the parameters from the URL
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const channel = await User.aggregate([
    // this will add subscribers and subscribedTo fields to the user object , like a join operation
    {
      $match: {
        username: username.toLowerCase() 
      }// match the user with the username provided in the URL
    },
    {
      $lookup:{
        from: "subscriptions", //model name in plural form and lowercase
        localField: "_id", 
        foreignField: "channel", //field in the Subscription model
        as: "subscribers" //name of the field in the User model
      } //we find out how many subscribers the channel has      
    },
    {
       $lookup:{
        from: "subscriptions", //model name in plural form and lowercase
        localField: "_id", 
        foreignField: "subscriber", //field in the Subscription model
        as: "subscribedto" //name of the field in the User model
      } //we find out how many channels the user is subscribed to
    },
    {
      $addFields: {
        subscribersCount: { 
          $size: "$subscribers"
         }, //count the number of subscribers
        subscribedToCount: {
          $size: "$subscribedto" } ,//count the number of channels the user is subscribed to
    isSubscribed: {
      $cond: {
        if: { $in: [req.user?._id, "$subscribers.subscriber"] }, //check if the user is subscribed to the channel
        then: true,
        else: false
      }
    }  // check if the user is subscribed to the channel
  } // add the fields to the user object
    },
    {
      $project: {
        fullName: 1, // 1 means include this field, 0 means exclude this field
        username: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      } // project the fields that we want to return
    }
  ]);
  
  console.log("Channel profile fetched:", channel);
  
  if (!channel || channel.length === 0) {
    throw new ApiError(404, "Channel not found");
  }

  return res.status(200).json(new ApiResponse(200, channel[0], "Channel profile fetched successfully")); 
  //channel[0] is used because aggregate returns an array of objects, we only need the first object
})

const getWatchHistory = asyncHandler(async (req, res) =>{

  // User.findById(req.user._id) -> this is a mongoose query to find the user by id, but by (req.user._id) we actually 
  // get the string id of the user from the database and mongoose will convert it to an ObjectId

  // but in aggregate we need to use mongoose.Types.ObjectId(req.user._id) to convert the string id to an ObjectId

  const user = await User.aggregate(
    [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id) // match the user with the id provided in the request
        }
      },
      {
        $lookup: {
          from: "videos", // model name in plural form and lowercase
          localField: "watchHistory", // field in the User model
          foreignField: "_id", // field in the Video model
          as: "watchHistory" , // name of the field in the User model
          pipeline: [
            {
              $lookup: {
                from: "users", // model name in plural form and lowercase
                localField: "owner", // field in the Video model
                foreignField: "_id", // field in the User model
                as: "owner", // name of the field in the Video model 
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1
                    }
                  },
                  {
                    $addFields: {
                      owner :{
                        $first: "$owner" // get the first element of the owner array
                      }
                    }
                  }
                ]
              }
            }
          ] 
        }
      }
    ]
  );

  return res.status(200).json(new ApiResponse(200, user[0]?.watchHistory || [], "Watch history fetched successfully"));
})


export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,  
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile,
   getWatchHistory
};       
