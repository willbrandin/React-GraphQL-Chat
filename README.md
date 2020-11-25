# React-GraphQL-Chat

Hello! This is a simple chat app build with React, GraphQL, Node, MySQL, and Bootstrap. Thank you to **Classed** on YouTube who put together the tutorial. You can find the tutorial on his [Youtube channel here](https://www.youtube.com/channel/UC2-slOJImuSc20Drbf88qvg).

# Getting Started

Server code is in the root of the directory and enters in `server.js`

## Install Dependencies

The server relies on npm for its dependencies. To install, run `npm install` in the root directory in your terminal.
Sequelize will require a `config` directory as well as a `config.js`. This should be created during `npm install` but the docs can be found [here](https://sequelize.org/master/manual/getting-started.html).

## Start the Server

To start the server, run `npm start`.

## Install Client Dependencies

The react client lives in the `client/` directory. Simply run `npm install` to install the dependencies.

## Start the client server

The client runs off of `create-react-app` so it should seem pretty familiar. Make sure your terminal is pointed to the `client/` directory. Then run `npm start`. React should compile and open a browser pointed to `http://localhost`.

## Apollo

The application uses Apollo, a tool to build GraphQL on the server as well as the client. Apollo gives a tool in the browers to view query schemas and test the api. After starting the server, the terminal will provide a link to `http://localhost` to view this.
