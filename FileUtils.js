const path = require("path");
const multer = require("multer");
// Set Storage Engine
const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

//Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
}).fields([
    { name: "photo", maxCount: 1 },
    { name: "identificationPhoto", maxCount: 1 },
]);

//Check file type
function checkFileType(file, cb) {
    const fileTypes = /jpeg|jpg|png|gif|pdf/;
    //check ext
    const extname = fileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    //check mime
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: Images or PDF only");
    }
}

module.exports = upload;
