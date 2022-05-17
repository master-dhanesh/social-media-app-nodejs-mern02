const mongoose = require("mongoose");
const { Schema } = mongoose;

const todoModel = new Schema({
    title: "String",
    description: "String",
});

const todo = mongoose.model("todo", todoModel);

module.exports = todo;
