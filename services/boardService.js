const Boom = require("boom");

const addBoard = async (id, kanbanList, name, ownedBy) => {
  const collection = this.$db.collection("boards");
  await collection.insertOne({ id, kanbanList, name, ownedBy });
  return { success: true, board: { id, kanbanList, name, ownedBy } };
};

const getBoards = async (ownedBy) => {
  const collection = this.$db.collection("boards");
  const boards = await collection.find({ ownedBy }).toArray();
  return { success: true, boards };
};

const getBoard = async (id) => {
  const collection = this.$db.collection("boards");
  const board = await collection.findOne({ id });
  return { success: true, board };
};

module.exports = {
  addBoard,
  getBoards,
  getBoard,
};
