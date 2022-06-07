const mongoose = require("mongoose");
const { Schema } = mongoose;

const postModel = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: [true, "title must not be empty"],
            minlength: [4, "title must be atleast 6 characters long"],
        },
        description: {
            type: String,
            trim: true,
        },
        media: {
            public_id: "",
            url: "",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
        dislikes: [
            {
                type: Schema.Types.ObjectId,
                ref: "user",
            },
        ],
    },
    { timestamps: true }
);

const post = mongoose.model("post", postModel);

module.exports = post;
