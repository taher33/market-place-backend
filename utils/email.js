const nodeMailer = require("nodemailer");

const sendMail = async option => {
  var transport = nodeMailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "taher latreche <taher7@gmail.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
    // html: option.message,
  };
  await transport.sendMail(mailOptions);
};

module.exports = sendMail;
