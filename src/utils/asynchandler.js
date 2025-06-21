// custom middleware wrapper to handle async errors in express.js

// using promise 
const asyncHandler = (requestHandler)=> {
    // this function takes a request handler and returns a new function that handles errors ie high order function
    return (req, res, next) => {
        // next is a function that is called to pass control to the next middleware in the stack or route handler
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=>next(err));
    // the request handler is called with req, res, next and if it throws an error, it is caught and passed to the next middleware 
    // passed to next(err) — which triggers Express’s error-handling middleware. if you don't pass next(err), the error will not be handled 
    };
}

export default asyncHandler;

// using async/await
// const asyncHandler = (requestHandler) => {
//         return async (req, res, next) => {
//         try {
//             await requestHandler(req, res, next);
//         } catch (err) {
//             res.status(err.code || 500).json({
//                 success: false,
//                 message: error.message || "Internal Server Error",
//             });
//         }