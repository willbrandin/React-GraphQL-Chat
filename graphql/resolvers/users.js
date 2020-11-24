const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError, AuthenticationError } = require("apollo-server");

const { User, Message } = require("../../models");
const { JWT_SECRET } = require("../../config/env.json");

const { Op } = require("sequelize");

module.exports = {
  Query: {
    users: async (_, __, { user }) => {
      try {
        if (!user) throw new AuthenticationError("UnAuthenticated");

        let users = await User.findAll({
          attributes: ["id", "username", "imageUrl", "createdAt"],
          where: { id: { [Op.ne]: user.id } },
        });

        const allUserMessages = await Message.findAll({
          where: {
            [Op.or]: [{ from: user.id }, { to: user.id }],
          },
          order: [["createdAt", "DESC"]],
        });

        users = users.map((otherUser) => {
          const latestMessage = allUserMessages.find(
            (m) => m.from === otherUser.id || m.to === otherUser.id
          );

          otherUser.latestMessage = latestMessage;
          return otherUser;
        });

        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};
      try {
        if (username.trim() == "")
          errors.username = "Username must not be empty";
        if (password.trim() == "")
          errors.password = "Password must not be empty";

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("Invalid input", { errors });
        }

        const user = await User.findOne({ where: { username } });

        if (!user) {
          errors.username = "User not found";
          throw new UserInputError("User not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = "Password is incorrect";
          throw new UserInputError("Password is incorrect", { errors });
        }

        const token = jwt.sign(
          {
            username,
            id: user.toJSON().id,
          },
          JWT_SECRET,
          { expiresIn: 60 * 60 }
        );

        return {
          ...user.toJSON(),
          token,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
  Mutation: {
    register: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};

      try {
        // Validate input
        if (email.trim() == "") errors.email = "Email must not be empty";
        if (username.trim() == "")
          errors.username = "Username must not be empty";
        if (password.trim() == "")
          errors.password = "Password must not be empty";
        if (confirmPassword.trim() == "")
          errors.confirmPassword = "Must Confirm Password";
        if (password !== confirmPassword)
          errors.confirmPassword = "Passwords must match";

        if (Object.keys(errors).length > 0) {
          // Do not hit DB if we already have errs
          throw errors;
        }

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        // Hash password
        password = await bcrypt.hash(password, 6);

        // Save user
        const user = await User.create({
          username,
          email,
          password,
        });

        const token = jwt.sign(
          {
            username,
            id: user.toJSON().id,
          },
          JWT_SECRET,
          { expiresIn: 60 * 60 }
        );

        return {
          ...user.toJSON(),
          token,
        };
      } catch (err) {
        console.log(err);

        if (err.name == "SequelizeUniqueConstraintError") {
          err.errors.forEach((e) => {
            let path = e.path.replace("users.", "");
            errors[path] = `${path} is in use`;
          });
        } else if (err.name == "SequelizeValidationError") {
          err.errors.forEach((e) => {
            errors[e.path] = e.message;
          });
        }

        throw new UserInputError("Bad Input", { errors });
      }
    },
  },
};
