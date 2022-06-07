var express = require("express");
var router = express.Router();
const cloudinary = require("cloudinary");
const formidable = require("formidable");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { nanoid } = require("nanoid");

const User = require("../models/userModel");
const Post = require("../models/postModel");
const { isLoggedIn } = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

passport.use(new LocalStrategy(User.authenticate()));

cloudinary.config({
    cloud_name: "dhanesh-cloudinary",
    api_key: "176257529696164",
    api_secret: "FsvsmtHChA4V5HJXdYSuMzzRwSg",
    secure: true,
});

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { isLoggedIn: false, user: req.user });
});

router.get("/login", function (req, res, next) {
    res.render("login", { isLoggedIn: false, user: req.user });
});

router.get("/register", function (req, res, next) {
    res.render("register", { isLoggedIn: false, user: req.user });
});

router.get("/home", isLoggedIn, async function (req, res, next) {
    const posts = await Post.find().populate("createdBy").exec();
    res.render("Home", { isLoggedIn: true, user: req.user, posts });
});

router.get("/timeline", isLoggedIn, async function (req, res, next) {
    const { posts } = await User.findById(req.user._id)
        .populate("posts")
        .exec();
    res.render("timeline", { isLoggedIn: true, user: req.user, posts });
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
        successRedirect: "/home",
        failureRedirect: "/login",
    }),
    function (req, res, next) {}
);

router.get("/profile", isLoggedIn, function (req, res, next) {
    User.find()
        .then((users) => {
            res.render("profile", { isLoggedIn: true, user: req.user });
        })
        .catch((err) => res.send(err));
});

router.get("/logout", isLoggedIn, function (req, res, next) {
    req.logout();
    res.redirect("/");
});

router.get("/forgot-password", function (req, res, next) {
    res.render("forgot", { isLoggedIn: false, user: req.user });
});

router.post("/forgot-password", async function (req, res, next) {
    const { email } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user)
        return res.send(
            "User not found! 404 <a href='/forgot-password'>Forgot Password</a>"
        );

    let resetcode = nanoid();
    user.passwordResetCode = resetcode;
    await user.save();

    let message = `Your reset password link is ${
        req.protocol +
        "://" +
        req.get("host") +
        "reset-code/" +
        resetcode +
        "/" +
        user._id
    }`;

    const dummylink =
        req.protocol +
        "://" +
        req.get("host") +
        "/reset-code/" +
        resetcode +
        "/" +
        user._id;

    // console.log(req.protocol + "://" + req.get("host") + req.originalUrl);

    // await sendEmail({
    //     email: user.email,
    //     message,
    // });
    console.log(dummylink);
    res.send(`<a target="_blank" href="${dummylink}">Reset Link</a>`);
    // res.redirect(`/login`);
});

router.get("/reset-code/:resetToken/:id", async function (req, res, next) {
    const { resetToken, id } = req.params;
    const user = await User.findById(id).exec();

    if (!user)
        return res.send(
            "User not found! 404 <a href='/forgot-password'>Forgot Password</a>"
        );

    if (user.passwordResetCode !== resetToken)
        return res.send(
            "Wrong Url! 404 <a href='/forgot-password'>Forgot Password</a>"
        );

    res.redirect(`/set-password/${id}`);
});

router.get("/set-password/:id", function (req, res, next) {
    res.render("setpassword", {
        id: req.params.id,
        isLoggedIn: false,
        user: req.user,
        isLoggedIn: false,
    });
});

router.post("/set-password/:id", async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id).exec();
        if (!user)
            return res.send(
                "User not found! 404 <a href='/forgot-password'>Forgot Password</a>"
            );
        await user.setPassword(req.body.password);
        user.passwordResetCode = undefined;
        await user.save();
        res.redirect("/login");
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.get("/change-password", isLoggedIn, function (req, res, next) {
    res.render("changepassword", { isLoggedIn: true, user: req.user });
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
        .then((user) => {
            res.render("update", { user });
            // res.render('update', {isLoggedIn:false , user: req.user})
        })
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

router.post("/create-post", isLoggedIn, async function (req, res, next) {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
        if (err) return res.send(err);
        const { title, description } = fields;
        const newPost = new Post({
            title,
            createdBy: req.user._id,
        });
        if (description) {
            newPost.description = description;
        }
        if (files && files.media.size !== 0) {
            const { public_id, secure_url } =
                await cloudinary.v2.uploader.upload(files.media.filepath, {
                    folder: "medias",
                    width: 1920,
                    crop: "scale",
                });
            newPost.media = {
                public_id,
                url: secure_url,
            };
        }

        req.user.posts.push(newPost._id);
        await req.user.save();
        await newPost.save();
        res.redirect("/timeline");
    });
});

router.get("/like/:id", isLoggedIn, async function (req, res, next) {
    const post = await Post.findById(req.params.id).exec();

    if (!post.likes.includes(req.user._id)) {
        post.likes.push(req.user._id);
        if (post.dislikes.includes(req.user._id)) {
            const ind = post.dislikes.indexOf(req.user._id);
            post.dislikes.splice(ind, 1);
        }
    }

    await post.save();
    res.redirect("/home");
});

router.get("/dislike/:id", isLoggedIn, async function (req, res, next) {
    const post = await Post.findById(req.params.id).exec();

    if (!post.dislikes.includes(req.user._id)) {
        post.dislikes.push(req.user._id);
        if (post.likes.includes(req.user._id)) {
            const ind = post.likes.indexOf(req.user._id);
            post.likes.splice(ind, 1);
        }
    }

    await post.save();
    res.redirect("/home");
});

module.exports = router;
