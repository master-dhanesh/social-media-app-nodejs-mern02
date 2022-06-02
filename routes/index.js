var express = require("express");
var router = express.Router();

const User = require("../models/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { isLoggedIn } = require("../middleware/auth");

const cloudinary = require("cloudinary");
const formidable = require("formidable");

passport.use(new LocalStrategy(User.authenticate()));

cloudinary.config({
    cloud_name: "dhanesh-cloudinary",
    api_key: "176257529696164",
    api_secret: "FsvsmtHChA4V5HJXdYSuMzzRwSg",
    secure: true,
});

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index");
});

router.get("/login", function (req, res, next) {
    res.render("login");
});

router.get("/register", function (req, res, next) {
    res.render("register");
});

router.post("/register", async function (req, res, next) {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.send(err);

        const { username, name, email, password } = fields;

        const newUser = new User({
            username,
            name,
            email,
        });

        if (files) {
            const { public_id, secure_url } =
                await cloudinary.v2.uploader.upload(files.avatar.filepath, {
                    folder: "avatars",
                    width: 1920,
                    crop: "scale",
                });
            newUser.avatar = {
                public_id,
                url: secure_url,
            };
        }

        User.register(newUser, password)
            .then((user) => {
                res.redirect("/login");
            })
            .catch((err) => res.send(err));
    });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/login",
    }),
    function (req, res, next) {}
);

router.get("/profile", isLoggedIn, function (req, res, next) {
    User.find()
        .then((users) => {
            res.render("profile", { users, loggedInUser: req.user });
        })
        .catch((err) => res.send(err));
});

router.get("/logout", isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect("/");
});

router.get("/forgot-password", function (req, res, next) {
    res.render("forgot");
});

router.post("/forgot-password", async function (req, res, next) {
    const user = await User.findOne({ email: req.body.email }).exec();
    if (!user)
        return res.send(
            "User not found! 404 <a href='/forgot-password'>Forgot Password</a>"
        );

    res.redirect(`/set-password/${user._id}`);
});

router.get("/set-password/:id", function (req, res, next) {
    res.render("setpassword", { id: req.params.id });
});

router.post("/set-password/:id", async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id).exec();
        if (!user)
            return res.send(
                "User not found! 404 <a href='/forgot-password'>Forgot Password</a>"
            );
        await user.setPassword(req.body.password);
        await user.save();
        res.redirect("/login");
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.get("/change-password", isLoggedIn, function (req, res, next) {
    res.render("changepassword");
});

router.post("/change-password/", async function (req, res, next) {
    try {
        const user = await User.findById(req.user._id).exec();
        await user.changePassword(req.body.oldpassword, req.body.newpassword);
        await user.save();
        res.redirect("/logout");
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.get("/delete/:id", isLoggedIn, async function (req, res, next) {
    const { id } = req.params;
    User.findByIdAndDelete(id)
        .then(async (user) => {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
            if (id === req.user._id) return res.redirect("/logout");
            res.redirect("/profile");
        })
        .catch((err) => res.send(err));
});

router.get("/update/:id", isLoggedIn, function (req, res, next) {
    const { id } = req.params;
    User.findById(id)
        .then((user) => res.render("update", { user }))
        .catch((err) => res.send(err));
});

router.post("/update/:id", isLoggedIn, async function (req, res, next) {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.send(err);

        const { username, name, email, oldavatar } = fields;
        const updatedUser = {
            username,
            name,
            email,
        };

        if (files && files.avatar) {
            await cloudinary.v2.uploader.destroy(oldavatar);
            const { public_id, secure_url } =
                await cloudinary.v2.uploader.upload(files.avatar.filepath, {
                    folder: "avatars",
                    width: 1920,
                    crop: "scale",
                });
            updatedUser.avatar = {
                public_id,
                url: secure_url,
            };
        }

        const { id } = req.params;
        User.findByIdAndUpdate(id, { $set: updatedUser }, { new: true })
            .then(() => {
                res.redirect("/profile");
            })
            .catch((err) => res.send(err));
    });
});

module.exports = router;
