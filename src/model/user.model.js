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

export const User = mongoose.model("User", userScheme); 