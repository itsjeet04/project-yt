import multer from "multer";

// Multer: Handles file upload from client
// Multer is a middleware saves it locally or in memory.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  //file is the file object sent from the client and cb is the callback function
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})