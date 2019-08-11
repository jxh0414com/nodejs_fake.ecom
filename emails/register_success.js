const nodemailer = require("nodemailer");

module.exports = function sendRegisterSuccess(user) {
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
    subject: "User Registered",
    text: `Congratulation ${user.first_name},
    You have registered for Good Lucking S&M. 
    You can now start ordering item and it will be sent to your doors.
    `
  };

  transport.sendMail(congrats);
};
