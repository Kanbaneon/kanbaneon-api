const { loginHandler, signUpHandler } = require("./handlers/authHandler");

const routes = [
  {
    method: "get",
    path: "/",
    handler: (request, h) => {
      return "Kanbaneon API server";
    },
  },
  {
    method: "post",
    path: "/api/v1/login",
    handler: loginHandler,
  },
  {
    method: "post",
    path: "/api/v1/signup",
    handler: signUpHandler,
  },
];

module.exports = routes;
