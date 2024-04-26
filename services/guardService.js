const Boom = require("boom");
const jwt = require("jsonwebtoken");

const guardJwt = (req, h, handler) => {
  try {
    if (!req.headers?.authorization) {
      return Boom.unauthorized("No bearer token");
    }

    const token = req.headers.authorization.split("Bearer ")[1];
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedData && decodedData.exp > new Date()) {
      return Boom.unauthorized("Token failed");
    }

    req.triggered_by = decodedData;
    return handler(req, h);
  } catch (ex) {
    return Boom.unauthorized("Token failed");
  }
};

module.exports = { guardJwt };
