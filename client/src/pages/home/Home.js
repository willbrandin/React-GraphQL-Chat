import React, { Fragment, useEffect } from "react";
import { Row, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSubscription, gql } from "@apollo/client";

import { useAuthDispatch, useAuthState } from "../../context/auth";
import { useMessageDispatch } from "../../context/message";

import Users from "./Users";
import Messages from "./Messages";

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const Home = () => {
  const { user } = useAuthState();
  const authDispatch = useAuthDispatch();
  const messageDispatch = useMessageDispatch();

  const { data: messageData, error: messageError } = useSubscription(
    NEW_MESSAGE
  );

  useEffect(() => {
    console.log("EFFECT");
    if (messageError) {
      console.log("MESSAGE ERROR");
      console.log(messageError);
    }

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser = user.id === message.to ? message.from : message.to;

      console.log(message);

      messageDispatch({
        type: "ADD_MESSAGE",
        payload: { id: otherUser, message },
      });
    }
  }, [messageData, messageError]);

  const logout = () => {
    authDispatch({ type: "LOGOUT" });
    window.location.href = "/login";
  };

  return (
    <Fragment>
      <Row className="bg-white justify-content-around mb-1">
        <Link to="/login">
          <Button variant="link">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="link">Register</Button>
        </Link>
        <Button variant="link" onClick={logout}>
          Logout
        </Button>
      </Row>

      <Row className="bg-white">
        <Users />
        <Messages />
      </Row>
    </Fragment>
  );
};

export default Home;
