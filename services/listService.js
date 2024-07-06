const Boom = require("boom");

const addList = async (boardId, addingList, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({ id: boardId, ownedBy });
    if (updatingBoard) {
      const kanbanList = updatingBoard.kanbanList;
      kanbanList.push(addingList);
      await collection.findOneAndUpdate(
        { id: boardId, ownedBy },
        {
          $set: { kanbanList },
          $currentDate: { lastModified: true },
        }
      );
      return { success: true, board: updatingBoard };
    }
    return Boom.unauthorized(new Error("Not an owner of this board"));
  } catch (ex) {
    return Boom.notImplemented("Adding Board failed", ex);
  }
};

module.exports = {
  addList
};
