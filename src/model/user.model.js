import mongoose, {Schema} from "mongoose";

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

export const User = mongoose.model("User", userScheme); 