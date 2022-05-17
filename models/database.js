const mongoose = require("mongoose");

exports.mongodbconnection = () => {
    mongoose
        .connect("mongodb://localhost/mernmorning")
        .then(() => console.log("database connected!"))
        .catch((err) => console.log(err.message));
};
