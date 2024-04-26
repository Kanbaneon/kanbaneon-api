const bcrypt = require("bcrypt");

const login = (username, password) => {};

const signUp = async (username, password) => {
  const collection = this.$db.collection("users");
  const hashedPassword = await hashPassword(password);
  await collection.insertOne({ username, password: hashedPassword });
  return { success: true };
};

const hashPassword = async (pwd, saltRounds = 10) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(pwd, salt);
    return hashedPassword;
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  login,
  signUp,
};
