const { MongoClient } = require("mongodb");

const initDB = async () => {
  try {
    const url = process.env.DB_URL;
    const client = new MongoClient(url);
    const dbName = process.env.DB_NAME;

    await client.connect();
    console.log("Connected successfully to DB");
    const db = client.db(dbName);
    return db;
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  initDB,
};
