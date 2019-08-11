const nodemailer = require("nodemailer");

module.exports = function sendResetToken(user) {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_SECRET
    }
  });

  const token = {
    from: '"Good Looking S&M" <info@GL_S&M.com>',
    to: user.email,
    subject: "Reset Password",
    text: `To reset password, please follow this link

    http://localhost:5000/users/reset/${user.resetToken}
    `
  };

  transport.sendMail(token);
};
