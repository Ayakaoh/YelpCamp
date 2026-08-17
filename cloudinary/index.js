//cloudinaryをCloudinaryStorgeに設定する
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


//まずcloudinaryを設定
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//CloudinaryStorageを設定
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp',//どこのフォルダにアップロードするか
        allowed_formats: ['jpeg', 'jpg', 'png']
    },
});
module.exports = {
    cloudinary,
    storage
}