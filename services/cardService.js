const Boom = require("boom");

const addCard = async (boardId, listId, addingCard, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({
      id: boardId,
      "kanbanList.id": listId,
      ownedBy,
    });
    if (updatingBoard) {
      const updatingList = updatingBoard.kanbanList.find(
        (list) => list.id === listId
      );
      updatingList.children.push(addingCard);
      await collection.findOneAndUpdate(
        { id: boardId, "kanbanList.id": listId, ownedBy },
        {
          $set: { "kanbanList.$[xxx]": updatingList },
          $currentDate: { lastModified: true },
        },
        { arrayFilters: [{ "xxx.id": listId }] }
      );
      return { success: true, board: updatingBoard };
    }
    return Boom.unauthorized(new Error("Not an owner of this board and list"));
  } catch (ex) {
    return Boom.notImplemented("Adding Card failed", ex);
  }
};

const updateCard = async (boardId, listId, cardId, card, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({
      id: boardId,
      "kanbanList.id": listId,
      "kanbanList.children.id": cardId,
      ownedBy,
    });
    if (updatingBoard) {
      const board = await collection.findOneAndUpdate(
        {
          id: boardId,
          "kanbanList.id": listId,
          "kanbanList.children.id": cardId,
          ownedBy,
        },
        {
          $set: { "kanbanList.$[xxx].children.$[xxxx]": card },
          $currentDate: { lastModified: true },
        },
        {
          arrayFilters: [{ "xxx.id": listId }, { "xxxx.id": cardId }],
          returnDocument: "after",
        }
      );
      return { success: true, board };
    }
    return Boom.unauthorized(new Error("Not an owner of this board and card"));
  } catch (ex) {
    return Boom.notImplemented("Updating Card failed", ex);
  }
};

const deleteCard = async (boardId, listId, cardId, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({
      id: boardId,
      "kanbanList.id": listId,
      "kanbanList.children.id": cardId,
      ownedBy,
    });
    if (updatingBoard) {
      const board = await collection.findOneAndUpdate(
        {
          id: boardId,
          "kanbanList.id": listId,
          "kanbanList.children.id": cardId,
          ownedBy,
        },
        {
          $pull: { "kanbanList.$[xxx].children": { id: cardId } },
        },
        {
          arrayFilters: [{ "xxx.id": listId }],
          returnDocument: "after",
        }
      );
      return { success: true, board };
    }
    return Boom.unauthorized(new Error("Not an owner of this board and card"));
  } catch (ex) {
    return Boom.notImplemented("Deleting Card failed", ex);
  }
};

const swapCardExternal = async (boardId, originalList, targetList, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({ id: boardId, ownedBy });
    if (updatingBoard) {
      const originalIndex = updatingBoard.kanbanList.findIndex(
        (list) => list.id === originalList.id
      );
      const targetIndex = updatingBoard.kanbanList.findIndex(
        (list) => list.id === targetList.id
      );
      updatingBoard.kanbanList[targetIndex] = { ...targetList };
      updatingBoard.kanbanList[originalIndex] = { ...originalList };

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

const swapCardInternal = async (
  boardId,
  listId,
  originalIndex,
  targetIndex,
  ownedBy
) => {
  try {
    const collection = this.$db.collection("boards");
    const updatingBoard = await collection.findOne({
      id: boardId,
      "kanbanList.id": listId,
      ownedBy,
    });
    if (updatingBoard) {
      const updatingList = updatingBoard.kanbanList.find(
        (list) => list.id === listId
      );
      const updatingCard = updatingList.children[originalIndex];

      updatingList.children = updatingList.children.filter(
        (card) => card.id !== updatingCard.id
      );
      updatingList.children.splice(targetIndex, 0, updatingCard);

      await collection.findOneAndUpdate(
        { id: boardId, "kanbanList.id": listId, ownedBy },
        {
          $set: {
            kanbanList: updatingBoard.kanbanList,
          },
          $currentDate: { lastModified: true },
        }
      );
      return { success: true, board: updatingBoard };
    }
    return Boom.unauthorized(new Error("Not an owner of this board and list"));
  } catch (ex) {
    return Boom.notImplemented("Deleting List failed", ex);
  }
};

module.exports = {
  addCard,
  updateCard,
  deleteCard,
  swapCardExternal,
  swapCardInternal,
};
