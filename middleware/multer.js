const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log(file);
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        let modifiedName =
            file.fieldname + "-" + Date.now() + path.extname(file.originalname);
        cb(null, modifiedName);
    },
});

function fileFilter(req, file, cb) {
    let filetypes = /jpeg|jpg|png|gif|svg/;
    let mimetype = filetypes.test(file.mimetype);
    let extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(
        "Error: File upload only supports the following filetypes - " +
            filetypes
    );
}

const upload = multer({
    storage,
    fileFilter,
}).single("avatar");

module.exports = upload;
