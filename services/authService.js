const bcrypt = require("bcrypt");
const Boom = require("boom");
const jwt = require("jsonwebtoken");

const login = async (username, password) => {
  const collection = this.$db.collection("users");
  const user = await collection.findOne({ username });
  if (!user) {
    return Boom.forbidden("Login failed");
  }

  const result = await bcrypt.compare(password, user.password);
  const token = await generateJwt({ username });
  return { success: result, token };
};

const signUp = async (username, password) => {
  const collection = this.$db.collection("users");
  const hashedPassword = await hashPassword(password);
  await collection.insertOne({ username, password: hashedPassword });
  return { success: true };
};

const generateJwt = async (payload) => {
  const token = jwt.sign({ ...payload }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
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
