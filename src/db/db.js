import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`) 
        // mongoose allows you to use the output to get new constants
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
        
    }catch (error){
        console.error("ERROR:", error);
        process.exit(1); // Exit the process with failure, node feature
    }

}

export default connectDB;