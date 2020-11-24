const {
  UserInputError,
  AuthenticationError,
  withFilter,
} = require("apollo-server");
const { Message, User } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
  Query: {
    getMessages: async (parent, { id }, { user }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        if (id == user.id) {
          throw new UserInputError("You can't message yourself");
        }

        const otherUser = await User.findOne({ where: { id } });

        if (!otherUser) {
          throw new UserInputError("User not found");
        }

        const validIds = [user.id, id];

        const messages = await Message.findAll({
          where: {
            from: { [Op.in]: validIds },
            to: { [Op.in]: validIds },
          },
          order: [["createdAt", "DESC"]],
        });

        return messages;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Mutation: {
    sendMessage: async (parent, { to, content }, { user, pubsub }) => {
      try {
        if (!user) throw new AuthenticationError("Unauthenticated");

        if (to == user.id) {
          throw new UserInputError("You can't message yourself");
        }

        if (!content.trim() === "") {
          throw new UserInputError("Message is empty");
        }

        const recipient = await User.findOne({ where: { id: to } });

        if (!recipient) {
          throw new UserInputError("User not found");
        }

        console.log(typeof to);

        const message = await Message.create({
          from: user.id,
          to: Number(to),
          content,
        });

        pubsub.publish("NEW_MESSAGE", { newMessage: message });

        return message;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        (_, __, { user, pubsub }) => {
          if (!user) throw new AuthenticationError("Unauthenticated");

          return pubsub.asyncIterator(["NEW_MESSAGE"]);
        },
        ({ newMessage }, _, { user }) => {
          // console.log(typeof user.id);
          // console.log(typeof newMessage.from);
          if (user.id === newMessage.from || user.id === newMessage.to) {
            return true;
          }

          return false;
        }
      ),
    },
  },
};
