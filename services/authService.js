const bcrypt = require("bcrypt");
const Boom = require("boom");
const jwt = require("jsonwebtoken");

const login = async (username, password) => {
  const collection = this.$db.collection("users");
  const user = await collection.findOne({ username });
  if (!user) {
    return Boom.unauthorized("Login failed");
  }

  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return Boom.unauthorized("Login failed");
  }

  const token = await generateJwt({ username, id: user._id });
  return { success: result, token, id: user._id };
};

const signUp = async (username, password) => {
  const collection = this.$db.collection("users");
  const existingUser = await collection.findOne({ username });
  if (existingUser) {
    return Boom.badData(
      `There is already a user called "${username}". Try login your account`
    );
  }

  const hashedPassword = await hashPassword(password);
  await collection.insertOne({ username, password: hashedPassword });
  return { success: true };
};

const reauth = async (token) => {
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedData && decodedData.exp > new Date()) {
    return Boom.unauthorized("Reauth failed");
  }
  return { success: true, reauth: decodedData };
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
  reauth,
};
