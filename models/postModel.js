const mongoose = require("mongoose");
const { Schema } = mongoose;

const postModel = new Schema(
    {
        title: {
            type: String,
            trim: true,
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
    },
    { timestamps: true }
);

const post = mongoose.model("post", postModel);

module.exports = post;
