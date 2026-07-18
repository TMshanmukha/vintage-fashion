import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

const storage = new CloudinaryStorage({

    cloudinary,

    params: {

        folder: "categories",

        allowed_formats: [
            "jpg",
            "jpeg",
            "png",
            "webp"
        ],

        transformation: [

            {
                width:400,
                height:400,
                crop:"fill"
            }

        ]

    }

});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;