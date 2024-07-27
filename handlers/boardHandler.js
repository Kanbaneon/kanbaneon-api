const Boom = require("boom");
const boardService = require("../services/boardService");

const boardHandler = {
  get: (req, h) => {
    try {
      const ownedBy = req.triggered_by.id;
      return boardService.getBoards(req, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  getById: (req, h) => {
    try {
      const id = req.params.boardId;
      return boardService.getBoard(req, id);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  putById: (req, h) => {
    try {
      const id = req.params.boardId;
      const ownedBy = req.triggered_by.id;
      const board =
        typeof req?.payload === "string"
          ? JSON.parse(req.payload)
          : req.payload;
      return boardService.updateBoard(req, id, board, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  post: (req, h) => {
    try {
      const { id, kanbanList, name } =
        typeof req?.payload === "string"
          ? JSON.parse(req.payload)
          : req.payload;
      const ownedBy = req.triggered_by.id;
      if (!id || !id) {
        return Boom.badRequest("ID or name is empty");
      }
      return boardService.addBoard(req, id, kanbanList, name, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  deleteById: (req, h) => {
    try {
      const id = req.params.boardId;
      const ownedBy = req.triggered_by.id;
      return boardService.deleteBoard(req, id, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = { boardHandler };
