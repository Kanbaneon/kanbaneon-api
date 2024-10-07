const Boom = require("boom");
const {
  updateWatchList,
  addWatchList,
  deleteWatchList,
} = require("./notificationService");
const uuid = require("uuid");

const addCard = async (req, boardId, listId, addingCard, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    const updatingBoard = await collection.findOne({
      id: boardId,
      "kanbanList.id": listId,
      ownedBy,
    });
    if (updatingBoard) {
      const updatingList = updatingBoard.kanbanList.find(
        (list) => list.id === listId
      );
      if (addingCard.isWatching) {
        delete addingCard.isWatching;
        const newWatcher = ownedBy;
        addingCard.watchers = [...(addingCard.watchers || []), newWatcher];
      } else {
        delete addingCard.isWatching;
        addingCard.watchers = [];
      }

      updatingList.children.push(addingCard);
      await collection.findOneAndUpdate(
        { id: boardId, "kanbanList.id": listId, ownedBy },
        {
          $set: { "kanbanList.$[xxx]": updatingList },
          $currentDate: { lastModified: true },
        },
        { arrayFilters: [{ "xxx.id": listId }] }
      );
      if (addingCard.isWatching) {
        const newWatchListItem = {
          id: uuid.v4(),
          boardId,
          listId,
          cardId: addingCard.id,
          type: "card",
          isWatching: true,
          lastModified: new Date(),
        };

        await addWatchList(req, ownedBy, newWatchListItem);
      }
      return { success: true, board: updatingBoard };
    }
    return Boom.unauthorized(new Error("Not an owner of this board and list"));
  } catch (ex) {
    return Boom.notImplemented("Adding Card failed", ex);
  }
};

const updateCard = async (req, boardId, listId, cardId, card, triggeredBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    const updatingBoard = await collection.findOne({
      id: boardId,
      "kanbanList.id": listId,
      "kanbanList.children.id": cardId,
    });
    if (updatingBoard) {
      if (
        updatingBoard.ownedBy !== triggeredBy &&
        !updatingBoard?.hasAccess?.includes(triggeredBy)
      ) {
        return Boom.unauthorized(
          new Error("You do not have access to this card.")
        );
      }

      if (card.isWatching) {
        delete card.isWatching;
        if (!card.watchers.includes(triggeredBy)) {
          card.watchers = [...card.watchers, triggeredBy];
        }
        const newWatchListItem = {
          id: uuid.v4(),
          boardId,
          listId,
          cardId,
          type: "card",
          isWatching: true,
          lastModified: new Date(),
        };

        await addWatchList(req, triggeredBy, newWatchListItem);
      } else {
        card.watchers = card.watchers.filter(
          (watcher) => watcher !== triggeredBy
        );
        await deleteWatchList(req, triggeredBy, cardId, "cardId");
      }

      const board = await collection.findOneAndUpdate(
        {
          id: boardId,
          "kanbanList.id": listId,
          "kanbanList.children.id": cardId,
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

const deleteCard = async (req, boardId, listId, cardId, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
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
      await deleteWatchList(req, ownedBy, cardId, "cardId");
      return { success: true, board };
    }
    return Boom.unauthorized(new Error("Not an owner of this board and card"));
  } catch (ex) {
    return Boom.notImplemented("Deleting Card failed", ex);
  }
};

const swapCardExternal = async (
  req,
  boardId,
  originalList,
  targetList,
  ownedBy
) => {
  try {
    const collection = req.mongo.db.collection("boards");
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
  req,
  boardId,
  listId,
  originalIndex,
  targetIndex,
  ownedBy
) => {
  try {
    const collection = req.mongo.db.collection("boards");
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
