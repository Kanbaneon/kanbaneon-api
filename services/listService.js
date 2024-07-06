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

const deleteList = async (boardId, listId, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({ id: boardId, ownedBy });
    if (updatingBoard) {
      const deletingList = updatingBoard.kanbanList.find(
        (list) => list.id === listId
      );
      if (deletingList) {
        updatingBoard.kanbanList = updatingBoard.kanbanList.filter(
          (list) => list.id !== listId
        );
        await collection.findOneAndUpdate(
          { id: boardId, ownedBy },
          {
            $set: {
              kanbanList: updatingBoard.kanbanList,
            },
            $currentDate: { lastModified: true },
          }
        );
        return { success: true, board: updatingBoard };
      }
      return Boom.notFound(
        new Error("Deleting List is not found in the board")
      );
    }
    return Boom.unauthorized(new Error("Not an owner of this board"));
  } catch (ex) {
    return Boom.notImplemented("Deleting Board failed", ex);
  }
};

module.exports = {
  addList,
  deleteList,
};
