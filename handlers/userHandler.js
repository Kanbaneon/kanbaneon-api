const Boom = require("boom");
const userService = require("../services/userService");

const userHandler = {
  get: (req, h) => {},
  post: (req, h) => {},
  bulkPost: (req, h) => {},
  put: (req, h) => {},
  bulkPut: (req, h) => {},
  delete: (req, h) => {
    try {
      const { password } = JSON.parse(req.payload);
      const { username } = req.params;
      const triggedBy = req.triggered_by.id;
      if (!username || !password) {
        return Boom.badRequest("Username or password is empty");
      }
      return userService.deleteUser(req, username, password, triggedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  bulkDelete: (req, h) => {},
};

module.exports = { userHandler };