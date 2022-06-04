const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        // host: "smpt.gmail.com",
        // port: 465,
        service: "gmail",
        auth: {
            user: "xxxx@gmail.com",
            pass: "xxxx",
        },
    });

    const mailOptions = {
        from: "Morning MERN <morning.mern@gmail.com>",
        to: options.email,
        subject: "Password Recovery Mail",
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
