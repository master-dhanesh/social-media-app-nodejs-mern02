const mongoose = require("mongoose");

exports.getconnection = () => {
    mongoose
        .connect("mongodb://localhost/usermern2")
        .then(() => console.log("mongodb connected"))
        .catch((err) => console.log(err.message));
};
