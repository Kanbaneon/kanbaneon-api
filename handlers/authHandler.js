const Boom = require("boom");
const authService = require("../services/authService");

const loginHandler = (req, h) => {
  try {
    const { username, password } = JSON.parse(req.payload);
    if (!username || !password) {
      return Boom.badRequest("Username or password is empty");
    }
    return authService.login(req, username, password);
  } catch (ex) {
    throw new Error(ex);
  }
};

const reauthHandler = (req, h) => {
  try {
    const { token } = JSON.parse(req.payload);
    if (!token) {
      return Boom.badRequest("Token is empty");
    }
    return authService.reauth(token);
  } catch (ex) {
    throw new Error(ex);
  }
};

const signUpHandler = (req, h) => {
  try {
    const { username, password, email } = JSON.parse(req.payload);
    if (!username || !password || !email) {
      return Boom.badRequest("Username/email or password is empty");
    }
    return authService.signUp(req, username, password, email);
  } catch (ex) {
    throw new Error(ex);
  }
};

const recoveryHandler = {
  sendEmail: (req, h) => {
    try {
      const payload = JSON.parse(req.payload);
      if (payload.type === "password") {
        return authService.sendPasswordRecovery(req, payload.username);
      }
      if (payload.type === "username") {
        return authService.sendUsernameRecovery(req, payload.email);
      }
      return Boom.badRequest(
        "There is no type parameter for recovery process."
      );
    } catch (ex) {
      throw new Error(ex);
    }
  },
  validateToken: (req, h) => {
    try {
      const { token } = req.params;
      if (token === "undefined") {
        return Boom.badRequest("Token is invalid.");
      }
      return authService.validateRecoveryToken(req, token);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  changePassword: (req, h) => {
    try {
      const { password, confirmPassword, token } = JSON.parse(req.payload);
      return authService.updatePassword(req, token, password, confirmPassword);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

const profileHandler = {
  get: (req, h) => {
    try {
      const userId = req.triggered_by.id;
      return authService.getProfile(req, userId);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  put: (req, h) => {
    try {
      const userId = req.triggered_by.id;
      const { name, email, details } = JSON.parse(req.payload);
      return authService.updateProfile(req, userId, name, email, details);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  uploadPicture: (req, h) => {
    try {
      const userId = req.triggered_by.id;
      const formData = req.payload.image;
      return authService.uploadPicture(req, userId, formData, h);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = {
  loginHandler,
  signUpHandler,
  reauthHandler,
  recoveryHandler,
  profileHandler,
};
