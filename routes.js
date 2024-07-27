const {
  loginHandler,
  signUpHandler,
  reauthHandler,
} = require("./handlers/authHandler");
const { boardHandler } = require("./handlers/boardHandler");
const { listHandler } = require("./handlers/listHandler");
const { cardHandler } = require("./handlers/cardHandler");
const { guardJwt } = require("./services/guardService");

const routes = [
  {
    method: "get",
    path: "/healthz",
    handler: (request, h) => {
      return "Kanbaneon API server is healthy";
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
  {
    method: "post",
    path: "/api/v1/reauth",
    handler: reauthHandler,
  },
  {
    method: "get",
    path: "/api/v1/boards",
    handler: (req, h) => guardJwt(req, h, boardHandler.get),
  },
  {
    method: "post",
    path: "/api/v1/boards",
    handler: (req, h) => guardJwt(req, h, boardHandler.post),
  },
  {
    method: "post",
    path: "/api/v1/boards/{boardId}/lists",
    handler: (req, h) => guardJwt(req, h, listHandler.post),
  },
  {
    method: "post",
    path: "/api/v1/boards/{boardId}/swap-lists",
    handler: (req, h) => guardJwt(req, h, listHandler.swap),
  },
  {
    method: "post",
    path: "/api/v1/boards/{boardId}/swap-cards-external",
    handler: (req, h) => guardJwt(req, h, cardHandler.swapExternal),
  },
  {
    method: "post",
    path: "/api/v1/boards/{boardId}/swap-cards-internal/{listId}",
    handler: (req, h) => guardJwt(req, h, cardHandler.swapInternal),
  },
  {
    method: "post",
    path: "/api/v1/boards/{boardId}/lists/{listId}/cards",
    handler: (req, h) => guardJwt(req, h, cardHandler.post),
  },
  {
    method: "get",
    path: "/api/v1/boards/{boardId}",
    handler: (req, h) => guardJwt(req, h, boardHandler.getById),
  },
  {
    method: "put",
    path: "/api/v1/boards/{boardId}",
    handler: (req, h) => guardJwt(req, h, boardHandler.putById),
  },
  {
    method: "put",
    path: "/api/v1/boards/{boardId}/lists/{listId}",
    handler: (req, h) => guardJwt(req, h, listHandler.putById),
  },
  {
    method: "put",
    path: "/api/v1/boards/{boardId}/lists/{listId}/cards/{cardId}",
    handler: (req, h) => guardJwt(req, h, cardHandler.putById),
  },
  {
    method: "delete",
    path: "/api/v1/boards/{boardId}",
    handler: (req, h) => guardJwt(req, h, boardHandler.deleteById),
  },
  {
    method: "delete",
    path: "/api/v1/boards/{boardId}/lists/{listId}",
    handler: (req, h) => guardJwt(req, h, listHandler.deleteById),
  },
  {
    method: "delete",
    path: "/api/v1/boards/{boardId}/lists/{listId}/cards/{cardId}",
    handler: (req, h) => guardJwt(req, h, cardHandler.deleteById),
  },
];

module.exports = routes;
