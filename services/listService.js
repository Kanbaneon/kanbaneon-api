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

const updateList = async (boardId, listId, list, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({ id: boardId, ownedBy });
    if (updatingBoard) {
      const updatingListIndex = updatingBoard.kanbanList.findIndex(
        (list) => list.id === listId
      );
      if (updatingListIndex !== -1) {
        updatingBoard.kanbanList[updatingListIndex] = {
          ...updatingBoard.kanbanList[updatingListIndex],
          id: list.listId,
          name: list.name,
        };
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
    return Boom.notImplemented("Updating List failed", ex);
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
    return Boom.notImplemented("Deleting List failed", ex);
  }
};

const swapList = async (boardId, originalIndex, targetIndex, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({ id: boardId, ownedBy });
    if (updatingBoard) {
      const originalList = updatingBoard.kanbanList[originalIndex];
      const targetList = updatingBoard.kanbanList[targetIndex];
      updatingBoard.kanbanList[targetIndex] = { ...originalList };
      updatingBoard.kanbanList[originalIndex] = { ...targetList };

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
    return Boom.unauthorized(new Error("Not an owner of this board"));
  } catch (ex) {
    return Boom.notImplemented("Deleting List failed", ex);
  }
};

module.exports = {
  addList,
  updateList,
  deleteList,
  swapList,
};
