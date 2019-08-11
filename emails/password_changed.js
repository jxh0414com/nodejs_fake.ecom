const nodemailer = require("nodemailer");

module.exports = function sendPasswordChanged(user) {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_SECRET
    }
  });

  const congrats = {
    from: '"Good Looking S&M" <info@GL_S&M.com>',
    to: user.email,
    subject: "Password Changed",
    text: `Congratulation ${user.first_name},
    Your password has been changed. If this is not your doing, Please contact us.
    `
  };

  transport.sendMail(congrats);
};
