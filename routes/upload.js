var express = require("express");
var router = express.Router();

const upload = require("../middleware/multer");

// /upload

// /upload/create
router.get("/create", (req, res) => {
    res.render("upload");
});

router.post("/create", (req, res) => {
    upload(req, res, (err) => {
        if (err) return res.send(err);
        const newUser = {
            username: req.body.username,
            avatar: req.file.filename,
        };
        res.json(newUser);
        return;
    });
});
module.exports = router;
