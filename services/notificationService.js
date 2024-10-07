const Boom = require("boom");

const addNotification = async (req, userId) => {
  try {
    const collection = req.mongo.db.collection("notifications");
    await collection.insertOne({
      userId,
      newsletter: true,
      watchlists: [],
      lastModified: new Date(),
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
    const boardCollection = req.mongo.db.collection("boards");
    const details = !!notification.watchlists.length
      ? await boardCollection
          .find({
            id: { $in: notification.watchlists.map((item) => item.boardId) },
          })
          .toArray()
      : [];
    return { success: true, notification, details };
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const updateNotification = async (req, userId, payload) => {
  try {
    const collection = req.mongo.db.collection("notifications");
    const boardCollection = req.mongo.db.collection("boards");
    const unwatchedItems = payload.watchlists.filter(
      (item) => item.isWatching === false || item.isDeleted === true
    );

    if (!!unwatchedItems.length) {
      await boardCollection.updateMany(
        {
          id: { $in: unwatchedItems.map((item) => item.boardId) },
          ownedBy: userId,
        },
        {
          $set: { "kanbanList.$[xxx].children.$[xxxx].isWatching": false },
          $currentDate: { lastModified: true },
        },
        {
          arrayFilters: [
            { "xxx.id": { $in: unwatchedItems.map((item) => item.listId) } },
            { "xxxx.id": { $in: unwatchedItems.map((item) => item.cardId) } },
          ],
        }
      );
    }

    const notification = await collection.findOneAndUpdate(
      {
        userId,
      },
      {
        $set: {
          newsletter: payload.newsletter,
          watchlists: payload.watchlists.filter((item) => !item.isDeleted),
        },
        $currentDate: { lastModified: true },
      },
      {
        returnDocument: "after",
        projection: { _id: 0, lastModified: 0, userId: 0 },
      }
    );
    return { success: true, notification };
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const addWatchList = async (req, userId, watchlistItem) => {
  try {
    const collection = req.mongo.db.collection("notifications");
    const notification = await collection.findOneAndUpdate(
      {
        userId,
      },
      {
        $push: { watchlists: watchlistItem },
        $currentDate: { lastModified: true },
      },
      {
        returnDocument: "after",
        projection: { _id: 0, lastModified: 0, userId: 0 },
      }
    );
    return { success: true, notification };
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const deleteWatchList = async (req, userId, cardId) => {
  try {
    const collection = req.mongo.db.collection("notifications");
    const notification = await collection.findOneAndUpdate(
      {
        userId,
      },
      {
        $pull: { watchlists: { cardId } },
      },
      {
        returnDocument: "after",
        projection: { _id: 0, lastModified: 0, userId: 0 },
      }
    );
    return { success: true, notification };
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

module.exports = {
  addNotification,
  getNotification,
  updateNotification,
  addWatchList,
  deleteWatchList,
};
