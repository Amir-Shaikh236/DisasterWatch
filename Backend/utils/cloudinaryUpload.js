import cloudinary from "../config/Cloudinary.js";

export const UploadToCloud = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream({
            folder: "DisasterWatch",
            resource_type: "image",
            ...options
        },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        upload.end(fileBuffer);
    });
}

