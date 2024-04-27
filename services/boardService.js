const Boom = require("boom");

const addBoard = async (id, kanbanList, name, ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    await collection.insertOne({ id, kanbanList, name, ownedBy });
    return { success: true, board: { id, kanbanList, name, ownedBy } };
  } catch (ex) {
    return Boom.notImplemented("Adding Board failed", ex);
  }
};

const updateBoard = async (id, ownedBy, board) => {
  try {
    const collection = this.$db.collection("boards");
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
    return Boom.unauthorized(
      new Error("Not an owner of this board")
    );
  } catch (ex) {
    return Boom.notImplemented("Updating Board failed", ex);
  }
};

const getBoards = async (ownedBy) => {
  try {
    const collection = this.$db.collection("boards");
    const boards = await collection.find({ ownedBy }).toArray();
    return { success: true, boards };
  } catch (ex) {
    return Boom.notFound("Getting Boards failed", ex);
  }
};

const getBoard = async (id) => {
  try {
    const collection = this.$db.collection("boards");
    const board = await collection.findOne({ id });
    return { success: true, board };
  } catch (ex) {
    return Boom.notFound("Getting Board by ID failed", ex);
  }
};

module.exports = {
  addBoard,
  updateBoard,
  getBoards,
  getBoard,
};
