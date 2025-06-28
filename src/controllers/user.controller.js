// controller is responsible for handling user-related requests
// bridge between routes and services

import asyncHandler from "../utils/asynchandler.js";


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
      
    const {username,fullName,email,avtar,coverImage,password} = req.body 
    // destructuring data from request body
    // form ,json data will be in req.body , url data will not be here but in req.query
    
    // testing 
    console.log("User data received:", {username,fullName,email,password});    


}) 

export default registerUser;