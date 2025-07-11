import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
       name : {
        type : String,
        required: true,
       },
       discription : {
        type : String,
        required: true,
       },
       videos :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Video", // reference to the Video model
       },
       owner :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User", // reference to the User model
       },
    }, 
    {
       timestamps: true, 
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);