const { Verification_Email_Template } = require("./emailTemplate");
const { transporter } = require("./email.config");

const SendVerificationCode = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: '"Agapay" <secure4agapay@gmail.com>',
      to: email, // list of receivers
      subject: "Verification Code", // Subject line
      text: "Verification Code", // plain text body
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        verificationCode
      ),
    });
    console.log("Email send Successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

module.exports = { SendVerificationCode };
