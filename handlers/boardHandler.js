const Boom = require("boom");
const boardService = require("../services/boardService");

const boardHandler = {
  get: (req, h) => {
    try {
      const ownedBy = req.triggered_by.id;
      return boardService.getBoards(ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
  post: (req, h) => {
    try {
      const { id, kanbanList, name } = JSON.parse(req?.payload);
      const ownedBy = req.triggered_by.id;
      if (!id || !id) {
        return Boom.badRequest("ID or name is empty");
      }
      if (!kanbanList.length) {
        return Boom.badRequest("KanbanList is empty");
      }
      return boardService.addBoard(id, kanbanList, name, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = { boardHandler };
