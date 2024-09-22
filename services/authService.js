const bcrypt = require("bcrypt");
const Boom = require("boom");
const jwt = require("jsonwebtoken");

const login = async (req, username, password) => {
  const collection = req.mongo.db.collection("users");
  const user = await collection.findOne({ username });
  if (!user) {
    const userWithEmail = await collection.findOne({ email: username });
    if (!userWithEmail) {
      return Boom.unauthorized("Login failed");
    }
    return authorize(password, userWithEmail);
  }
  return authorize(password, user);
};

const authorize = async (password, user) => {
  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return Boom.unauthorized("Login failed");
  }

  const token = await generateJwt({
    username: user.username,
    id: user._id,
    email: user.email,
  });
  return { success: result, token, id: user._id };
};

const signUp = async (req, username, password, email) => {
  const collection = req.mongo.db.collection("users");
  const existingUser = await collection.findOne({ username });
  if (existingUser) {
    return Boom.badData(
      `There is already a user called "${username}". Try login your account`
    );
  }

  const existingEmail = await collection.findOne({ email });
  if (existingEmail) {
    return Boom.badData(
      `There is already an email registered with "${email}". Try login your account`
    );
  }

  const hashedPassword = await hashPassword(password);
  await collection.insertOne({
    username,
    password: hashedPassword,
    email,
    createdAt: new Date(),
  });
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

const getDetails = async (req, userId) => {
  try {
    const collection = req.mongo.db.collection("profiles");
    const existingProfile = await collection.findOne(
      { userId },
      { projection: { _id: 0, lastModified: 0, userId: 0 } }
    );
    if (existingProfile) {
      return existingProfile;
    }
    return null;
  } catch (ex) {
    console.error(ex);
  }
};

const updateDetails = async (req, userId, details) => {
  try {
    const { occupation, teams, organization, location, profilePicture } =
      details;
    const collection = req.mongo.db.collection("profiles");
    const updatedDetails = await collection.findOneAndUpdate(
      { userId },
      {
        $set: { occupation, teams, organization, location, profilePicture },
        $currentDate: { lastModified: true },
      },
      {
        returnDocument: "after",
        upsert: true,
        projection: { _id: 0, lastModified: 0, userId: 0 },
      }
    );
    return updatedDetails;
  } catch (ex) {
    console.error(ex);
  }
};

const getProfile = async (req, userId) => {
  try {
    const collection = req.mongo.db.collection("users");
    const ObjectID = req.mongo.ObjectID;
    const existingUser = await collection.findOne({
      _id: new ObjectID(userId),
    });
    if (existingUser) {
      const details = await getDetails(req, userId);

      return {
        success: true,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          name: existingUser.name,
          details,
        },
      };
    }
    return Boom.notFound("Getting profile failed", ex);
  } catch (ex) {
    console.error(ex);
  }
};

const updateProfile = async (req, userId, email, name, details) => {
  try {
    const collection = req.mongo.db.collection("users");
    const ObjectID = req.mongo.ObjectID;
    const existingUser = await collection.findOne({
      _id: new ObjectID(userId),
    });
    if (existingUser) {
      await collection.findOneAndUpdate(
        {
          _id: new ObjectID(userId),
        },
        {
          $set: { name, email },
          $currentDate: { lastModified: true },
        }
      );

      const updatedDetails = await updateDetails(req, userId, details);

      return {
        success: true,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email,
          name,
          details: updatedDetails,
        },
      };
    }
    return Boom.notFound("Getting profile failed", ex);
  } catch (ex) {
    console.error(ex);
  }
};

module.exports = {
  login,
  signUp,
  reauth,
  getProfile,
  updateProfile,
};
