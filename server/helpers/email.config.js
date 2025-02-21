const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'dictcalabarzon@gmail.com',
    pass: 'xico jceq erwp qovk',
  },
});

module.exports = { transporter };
