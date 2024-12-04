const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'secure4agapay@gmail.com',
    pass: 'xico jceq erwp qovk',
  },
});

module.exports = { transporter };
