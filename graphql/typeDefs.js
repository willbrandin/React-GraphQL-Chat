const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    username: String!
    email: String
    createdAt: String!
    token: String
    latestMessage: Message
    imageUrl: String
  }
  type Message {
    uuid: String!
    content: String!
    from: ID!
    to: ID!
    createdAt: String!
  }
  type Query {
    users: [User]!
    login(username: String!, password: String!): User!
    getMessages(id: ID!): [Message]!
  }
  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      confirmPassword: String!
    ): User!
    sendMessage(to: ID!, content: String!): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`;
