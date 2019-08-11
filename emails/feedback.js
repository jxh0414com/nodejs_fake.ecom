const nodemailer = require("nodemailer");

module.exports = function sendFeedback(
  subject,
  name,
  email,
  phone,
  address,
  message
) {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_SECRET
    }
  });

  const output = `
  <p> You have a new feedback from customers </p>
  <h3> Contact Details </h3>
  <ul>
    <li> Name: ${name} </li>
    <li> Email: ${email} </li>
    <li> Phone: ${phone} </li>
    <li> Address: ${address} </li>
  </ul>
  <h3> Messages </h3>
    <h4> Subject: ${subject} </h4>
  <p>${message}</p> 
  `;

  const feedback = {
    from: email,
    to: '"Good Looking S&M" <info@GL_S&M.com>',
    subject: subject,
    html: output
  };

  transport.sendMail(feedback);
};
