const mailer = require("nodemailer");

const getAuth = () => {
  const { EMAIL_SENDER, EMAIL_SENDER_PASSWORD } = process.env;

  const auth = {
    user: EMAIL_SENDER,
    pass: EMAIL_SENDER_PASSWORD,
  };
  return auth;
};

const getMailer = () => {
  const auth = getAuth();
  const mail = mailer.createTransport({
    service: "Gmail",
    auth,
  });

  return mail;
};

const sendEmailHTML = (subject, to, html) => {
  const auth = getAuth();
  const mailObject = {
    from: auth.user,
    to,
    subject,
    html,
  };

  const mail = getMailer();
  mail
    .sendMail(mailObject)
    .then((result) => {
      console.log("Email is sent. ", result);
    })
    .catch((err) => {
      console.error(err);
    });
};

const sendEmailText = (subject, to, text) => {
  const auth = getAuth();
  const mailObject = {
    from: auth.user,
    to,
    subject,
    text,
  };

  const mail = getMailer();
  mail
    .sendMail(mailObject)
    .then((result) => {
      console.log("Email is sent. ", result);
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = {
  sendEmailHTML,
  sendEmailText,
};
