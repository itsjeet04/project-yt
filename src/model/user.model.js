import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userScheme = new Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index : true,
        // used to search for the user
    },
    email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
    fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
    avtar : {
            type: String,  // URL cloudinary
            required: true,
    },
    coverimage : {
            type: String,  
            required: false,
    },
    watchHistory: [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Video" // Reference to the Video model
        }
    ],
    password: {
            type: String, // encrypted password 
            required: [true, "Password is required"],
    },
    refreshToken: {
        type : String,
    }
}, {
    timestamps: true, // createdAt and updatedAt fields
})


userScheme.pre("save", async function (next) {
    // dont use arrow function here, because it does not have its own this context
    // this function is called before saving the user to the database
    if (this.isModified("password")) {
        // if the password is modified, hash it
    this.password = await bcrypt.hash(this.password, 10);
    next();
    }
})

userScheme.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password);
}

// Access Token → grant short-lived access to protected resources.
// Refresh Token → used to obtain a new access token when the current one expires.
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        // payload
        {
            _id: this._id, // User's MongoDB ObjectId
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//  When the access token expires, client sends refresh token to get a new access token.
// Refresh Tokens should always be stored securely 
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userScheme); 