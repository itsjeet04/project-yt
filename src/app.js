import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app =express();

// app.use is a method to mount middleware in express.js

app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
}))

app.use(express.json({limit: '10kb'}));
// accept json data 

app.use(express.urlencoded({ extended: true }));
// accept url encoded data

app.use(express.static('public'));
// serve static files from the public directory, accessed directly from the browser in /public

app.use(cookieParser());


// import routes
import userRoutes from './routes/user.routes.js'; 

// routes declaration as middleware
app.use('/api/v1/users', userRoutes);


export default app;