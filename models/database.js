const mongoose = require("mongoose");

exports.getconnection = () => {
    mongoose
        .connect("mongodb://localhost/usermern2")
        // .connect("mongodb+srv://dhanesh-malviya:dhanesh123@mastercluster.i7cpa.mongodb.net/morningmern02?retryWrites=true&w=majority")
        .then(() => console.log("mongodb connected"))
        .catch((err) => console.log(err.message));
};
