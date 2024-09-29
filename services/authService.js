const bcrypt = require("bcrypt");
const crypto = require("crypto");
const Boom = require("boom");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const uuid = require("uuid");
const { sendEmailHTML } = require("./emailService");
const { readHTMLFile, fillTemplate } = require("./fileService");

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
    return Boom.internal("[Error] ", ex);
  }
};

const sendPasswordRecovery = async (req, username) => {
  try {
    const collection = req.mongo.db.collection("users");
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      const html = await readHTMLFile(
        "templates/Password_Recovery_Template.html"
      );
      const token = uuid.v7();
      const createdAt = new Date();
      const expiredAt = new Date();
      expiredAt.setMinutes(createdAt.getMinutes() + 10);
      await collection.findOneAndUpdate(
        {
          username,
        },
        {
          $set: { resetToken: { value: token, createdAt, expiredAt } },
          $currentDate: { lastModified: true },
        }
      );

      const domain =
        process.env.ENV === "local"
          ? "http://localhost:3000"
          : `https://kanbaneon.netlify.app`;
      const templateReplacement = {
        uuid: token,
        passwordResetLink: `${domain}/recovery?token=${token}`,
        time: createdAt.toLocaleTimeString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
      const template = fillTemplate(html, templateReplacement);
      const email = existingUser.email;
      sendEmailHTML("[Kanbaneon] Please reset your password", email, template);
      return { success: true };
    }
    return Boom.notFound("There is no existing user.");
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const sendUsernameRecovery = async (req, email) => {
  try {
    const collection = req.mongo.db.collection("users");
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      const html = await readHTMLFile(
        "templates/Username_Recovery_Template.html"
      );
      const createdAt = new Date();
      const templateReplacement = {
        uuid: uuid.v4(),
        username: existingUser.username,
        time: createdAt.toLocaleTimeString("en-us", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };
      const template = fillTemplate(html, templateReplacement);
      const email = existingUser.email;
      sendEmailHTML("[Kanbaneon] Username recovery", email, template);
      return { success: true };
    }
    return Boom.notFound("There is no existing user with this email.");
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
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
    return {};
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const validateRecoveryToken = async (req, token) => {
  try {
    const collection = req.mongo.db.collection("users");
    const existingUser = await collection.findOne({
      "resetToken.value": token,
    });
    if (existingUser) {
      if (existingUser.resetToken?.expiredAt > new Date()) {
        return { success: true };
      }
      return Boom.expectationFailed("The link has expired.");
    }
    return Boom.notFound("The link has expired.");
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const updatePassword = async (req, token, password, confirmPassword) => {
  try {
    const collection = req.mongo.db.collection("users");
    const existingUser = await collection.findOne({
      "resetToken.value": token,
    });
    if (existingUser) {
      if (existingUser.resetToken?.expiredAt > new Date()) {
        if (password !== confirmPassword) {
          return Boom.badRequest("Both passwords must match.");
        }
        const hashedPassword = await hashPassword(password);
        await collection.findOneAndUpdate(
          {
            username: existingUser.username,
          },
          {
            $set: { password: hashedPassword, resetToken: undefined },
            $currentDate: { lastModified: true },
          }
        );
        return { success: true };
      }
      return Boom.expectationFailed("The link has expired.");
    }
    return Boom.notFound("The link has expired.");
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
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
    return Boom.internal("[Error] ", ex);
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
    return Boom.internal("[Error] ", ex);
  }
};

const uploadPicture = async (req, userId, formData, h) => {
  try {
    const collection = req.mongo.db.collection("users");
    const profileCollection = req.mongo.db.collection("profiles");
    const ObjectID = req.mongo.ObjectID;
    const existingUser = await collection.findOne({
      _id: new ObjectID(userId),
    });
    if (existingUser) {
      const response = await fetch(process.env.IMG_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${process.env.IMG_API_KEY}`,
        },
        body: formData,
      });

      const imgData = await response.json();
      if (imgData.success) {
        const updatedDetails = await profileCollection.findOneAndUpdate(
          { userId },
          {
            $set: { profilePicture: imgData.data },
            $currentDate: { lastModified: true },
          },
          {
            returnDocument: "after",
            upsert: true,
            projection: { _id: 0, lastModified: 0, userId: 0 },
          }
        );

        return imgData;
      }

      return Boom.expectationFailed("Uploading profile picture failed");
    }
    return Boom.notFound("Getting profile failed", ex);
  } catch (ex) {
    console.error(ex);
    return Boom.internal("[Error] ", ex);
  }
};

const updateProfile = async (req, userId, name, email, details) => {
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
    return Boom.internal("[Error] ", ex);
  }
};

module.exports = {
  login,
  signUp,
  reauth,
  getProfile,
  updateProfile,
  uploadPicture,
  sendPasswordRecovery,
  sendUsernameRecovery,
  validateRecoveryToken,
  updatePassword,
};
