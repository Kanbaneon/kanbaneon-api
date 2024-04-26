const Boom = require("boom");
const authService = require("../services/authService");

const loginHandler = (req, h) => {
  try {
    const { username, password } = req.payload;
    if (!username || !password) {
      return Boom.badRequest("Username or password is empty");
    }
    return authService.login(username, password);
  } catch (ex) {
    throw new Error(ex);
  }
};

const signUpHandler = (req, h) => {
  try {
    const { username, password } = req.payload;
    if (!username || !password) {
      return Boom.badRequest("Username or password is empty");
    }
    return authService.signUp(username, password);
  } catch (ex) {
    throw new Error(ex);
  }
};

module.exports = {
  loginHandler,
  signUpHandler,
};
