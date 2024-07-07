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
      const cardId = req.params.cardId;
      const ownedBy = req.triggered_by.id;
      const card =
        typeof req?.payload === "string"
          ? JSON.parse(req.payload)
          : req.payload;
      return cardService.updateCard(boardId, listId, cardId, card, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  deleteById: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const listId = req.params.listId;
      const cardId = req.params.cardId;
      const ownedBy = req.triggered_by.id;
      return cardService.deleteCard(boardId, listId, cardId, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = { cardHandler };
