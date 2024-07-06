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

      return listService.addList(boardId, addingList, ownedBy);
    } catch (ex) {
      throw new Error(ex);
    }
  },
};

module.exports = { listHandler };
