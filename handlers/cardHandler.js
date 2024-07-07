const Boom = require("boom");
const cardService = require("../services/cardService");

const cardHandler = {
  post: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const listId = req.params.listId;
      const addingCard =
        typeof req?.payload === "string"
          ? JSON.parse(req.payload)
          : req.payload;
      const ownedBy = req.triggered_by.id;

      return cardService.addCard(boardId, listId, addingCard, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  putById: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const listId = req.params.listId;
      const ownedBy = req.triggered_by.id;
      const list =
        typeof req?.payload === "string"
          ? JSON.parse(req.payload)
          : req.payload;
      return listService.updateList(boardId, listId, list, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  deleteById: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const listId = req.params.listId;
      const ownedBy = req.triggered_by.id;
      return listService.deleteList(boardId, listId, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = { cardHandler };
