import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import app from "./app.js";
import connectDB from "./db/db.js";


connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("Mongoose/app connection error:", error);
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        }
        )
    })
    .catch((error) => {
        console.error("ERROR in connecting DB", error);
    })

/*
another approach: Using async/await with IIFE in index.js
const app = express();

// iffe // Immediately Invoked Function Expression
 (async()=>{
     try  {
        await  mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("Mongoose connection error:", err);
        throw error;
                })

        app.listen(process.env.PORT , () => {
            console.log(`Server is running on port ${process.env.PORT}`); 
        });        
    } catch (error) {
        console.error("ERROR:", error);
        throw error;
    }
 })()
    */
