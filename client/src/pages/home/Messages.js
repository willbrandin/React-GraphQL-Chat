import React, { Fragment, useEffect, useState } from "react";
import { Col, Form } from "react-bootstrap";
import { gql, useLazyQuery, useMutation } from "@apollo/client";

import { useMessageDispatch, useMessageState } from "../../context/message";

import Message from "./Message";

const SEND_MESSAGE = gql`
  mutation sendMessage($to: ID!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const GET_MESSAGES = gql`
  query getMessages($id: ID!) {
    getMessages(id: $id) {
      uuid
      from
      to
      createdAt
      content
    }
  }
`;

const Messages = () => {
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();

  const [content, setContent] = useState("");

  const selectedUser = users?.find((u) => u.selected === true);
  const messages = selectedUser?.messages;

  const [
    getMessages,
    { data: messagesData, loading: messagesLoading },
  ] = useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (e) => console.log(e),
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { id: selectedUser.id } });
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          id: selectedUser?.id,
          messages: messagesData.getMessages,
        },
      });
    }
  }, [messagesData]);

  const submitMessage = (e) => {
    e.preventDefault();

    if (content.trim() === "" || !selectedUser) return;

    sendMessage({
      variables: { to: selectedUser.id, content },
    });

    setContent("");
  };

  let selectedChatMarkup;

  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend</p>;
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading...</p>;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((m, i) => (
      <Fragment key={m.uuid}>
        <Message message={m} />
        {i === messages.length - 1 ?? (
          <div className="invisible">
            <hr className="m-0"></hr>
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = <p className="info-text">You are now connected</p>;
  }

  return (
    <Col xs={10} md={8}>
      <div className="messages-box d-flex flex-column-reverse">
        {selectedChatMarkup}
      </div>
      <div>
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center">
            <Form.Control
              type="text"
              className="rounded-pill bg-light border-0 p-4"
              placeholder="Type a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <i
              class="fas fa-paper-plane text-primary ml-2"
              onClick={submitMessage}
              role="button"
            />
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
};

export default Messages;
