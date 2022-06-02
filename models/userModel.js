const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const plm = require("passport-local-mongoose");

const userModel = new Schema({
    username: {
        type: String,
        trim: true,
        minlength: [3, "Username must be atleast 3 characters"],
        required: [true, "Username required"],
        unique: true,
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email required"],
        validate: [validator.isEmail, "Invalid Email"],
    },
    name: {
        type: String,
        trim: true,
        minlength: [5, "Name must be atleast 5 characters"],
        required: [true, "Name required"],
    },
    password: {
        type: String,
        // minlength: [6, "Password must be atleast 6 characters"],
        // required: [true, "Password required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    avatar: {
        public_id: "",
        url: "",
    },
    posts: [{ type: Schema.Types.ObjectId, ref: "post" }],
    passwordResetCode: String,
});

userModel.plugin(plm);
const user = mongoose.model("user", userModel);

module.exports = user;
