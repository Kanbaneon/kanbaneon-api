const Boom = require("boom");
const { deleteWatchList } = require("./notificationService");

const addBoard = async (req, id, kanbanList, name, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    await collection.insertOne({
      id,
      kanbanList,
      name,
      ownedBy,
      createdAt: new Date(),
    });
    return { success: true, board: { id, kanbanList, name, ownedBy } };
  } catch (ex) {
    return Boom.notImplemented("Adding Board failed", ex);
  }
};

const updateBoard = async (req, id, board, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    const updatingBoard = await collection.findOne({ id, ownedBy });
    if (updatingBoard) {
      await collection.findOneAndUpdate(
        { id, ownedBy },
        {
          $set: { name: board.name },
          $currentDate: { lastModified: true },
        }
      );
      return { success: true, board };
    }
    return Boom.unauthorized(new Error("Not an owner of this board"));
  } catch (ex) {
    return Boom.notImplemented("Updating Board failed", ex);
  }
};

const deleteBoard = async (req, id, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    const deletingBoard = await collection.findOne({ id, ownedBy });
    if (deletingBoard) {
      await collection.deleteOne({ id, ownedBy });
      await deleteWatchList(req, ownedBy, id, "boardId");
      return { success: true, board: {} };
    }
    return Boom.unauthorized(new Error("Not an owner of this board"));
  } catch (ex) {
    return Boom.notImplemented("Deleting Board failed", ex);
  }
};

const deleteBoards = async (req, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    await collection.deleteMany({ ownedBy });
    return { success: true };
  } catch (ex) {
    return Boom.notImplemented("Deleting Boards failed", ex);
  }
};

const getBoards = async (req, ownedBy) => {
  try {
    const collection = req.mongo.db.collection("boards");
    const boards = await collection.find({ ownedBy }).toArray();
    return { success: true, boards };
  } catch (ex) {
    return Boom.notFound("Getting Boards failed", ex);
  }
};

const getBoard = async (req, id) => {
  try {
    const collection = req.mongo.db.collection("boards");
    const board = await collection.findOne({ id });
    if (board) {
      return { success: true, board };
    }
    return Boom.notFound("Getting Board by ID failed");
  } catch (ex) {
    return Boom.notFound("Getting Board by ID failed", ex);
  }
};

module.exports = {
  addBoard,
  updateBoard,
  deleteBoard,
  deleteBoards,
  getBoards,
  getBoard,
};
