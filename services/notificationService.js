const Boom = require("boom");

const createNotification = async (req, userId) => {
  try {
    const collection = req.mongo.db.collection("notifications");
    await collection.insertOne({
      userId,
      newsletter: true,
      watchlists: [],
      lastModified: new Date()
    });
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const getNotification = async (req, userId) => {
  try {
    const collection = req.mongo.db.collection("notifications");
    const notification = await collection.findOne(
      {
        userId,
      },
      { projection: { _id: 0, lastModified: 0, userId: 0 } }
    );
    return { success: true, notification };
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

module.exports = {
  createNotification,
  getNotification,
};
