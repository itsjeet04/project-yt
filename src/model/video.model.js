import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// mongooseAggregatePaginate helps in paginating the results of aggregate queries 
// Pagination lets you:Return a subset of data per page.Make the API efficient and fast.


const videoSchema = new mongoose.Schema({

        videoFile : {
            type : String, 
            required: true, 
        },
        thumbnail: {
            type: String, 
            required: true, 
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, // from cloudinary
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
    timestamps: true, // createdAt and updatedAt fields
    });

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema); 