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

router.get("/profile", isLoggedIn, function (req, res, next) {
    // console.log(req.user);
    User.find()
        .then((users) => {
            res.render("profile", { users });
        })
        .catch((err) => res.send(err));
});

router.get("/logout", function (req, res, next) {
    req.logout();
    res.redirect("/");
});

module.exports = router;
