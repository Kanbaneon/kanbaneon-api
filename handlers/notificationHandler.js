const Boom = require("boom");
const notificationService = require("../services/notificationService");

const notificationHandler = {
  get: (req, h) => {
    try {
      const userId = req.triggered_by.id;
      return notificationService.getNotification(req, userId);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  post: (req, h) => {},
  put: (req, h) => {},
  delete: (req, h) => {},
};

module.exports = { notificationHandler };
