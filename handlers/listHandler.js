const Boom = require("boom");
const listService = require("../services/listService");

const listHandler = {
  post: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const addingList =
        typeof req?.payload === "string"
          ? JSON.parse(req.payload)
          : req.payload;
      const ownedBy = req.triggered_by.id;

      return listService.addList(req, boardId, addingList, ownedBy);
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
      return listService.updateList(req, boardId, listId, list, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  deleteById: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const listId = req.params.listId;
      const ownedBy = req.triggered_by.id;
      return listService.deleteList(req, boardId, listId, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  swap: (req, h) => {
    try {
      const boardId = req.params.boardId;
      const originalIndex = req.query.from;
      const targetIndex = req.query.to;
      const ownedBy = req.triggered_by.id;
      return listService.swapList(
        req,
        boardId,
        originalIndex,
        targetIndex,
        ownedBy
      );
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = { listHandler };
