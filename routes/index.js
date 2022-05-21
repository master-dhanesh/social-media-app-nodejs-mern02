var express = require("express");
var router = express.Router();

const User = require("../models/userModel");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { isLoggedIn } = require("../middleware/auth");

passport.use(new LocalStrategy(User.authenticate()));

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

router.post("/register", function (req, res, next) {
    const { username, name, email, password } = req.body;
    const newUser = new User({ username, name, email });

    User.register(newUser, password)
        .then((user) => {
            res.redirect("/login");
        })
        .catch((err) => res.send(err));

    // User.create(req.body)
    //     .then(() => res.redirect("/login"))
    //     .catch((err) => {
    //         if (err._message) {
    //             const { _message, name, message } = err;
    //             res.json({ _message, name, message });
    //         } else {
    //             res.send(err);
    //         }
    //     });
});

router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/login",
    }),
    function (req, res, next) {}
);

// router.post("/login", function (req, res, next) {
//     passport.authenticate("local", function (err, user, info) {
//         if (err) return res.send(err);
//         if (!user) return res.send(info);
//         req.logIn(user, function (err) {
//             if (err) return next(err);
//             res.redirect("/profile");
//         });
//     })(req, res, next);
// });

router.get("/profile", isLoggedIn, function (req, res, next) {
    // console.log(req.user);
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

module.exports = router;
