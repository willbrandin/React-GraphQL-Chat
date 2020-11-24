import React from "react";
import { Col, Image } from "react-bootstrap";
import { gql, useQuery } from "@apollo/client";
import classNames from "classnames";

import { useMessageDispatch, useMessageState } from "../../context/message";

const GET_USERS = gql`
  query users {
    users {
      id
      username
      createdAt
      imageUrl
      latestMessage {
        from
        to
        content
        createdAt
      }
    }
  }
`;

const Users = () => {
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();
  const selectedUser = users?.find((u) => u.selected === true)?.id;

  const { loading } = useQuery(GET_USERS, {
    onCompleted: (data) => dispatch({ type: "SET_USERS", payload: data.users }),
    onError: (err) => console.log(err),
  });

  let usersMarkup;
  // Could be it's own component, no?
  if (!users || loading) {
    usersMarkup = <p>Loading...</p>;
  } else if (users.length === 0) {
    usersMarkup = <p>No users have joined yet...</p>;
  } else if (users.length > 0) {
    usersMarkup = users.map((user) => {
      const selected = user.id === selectedUser;
      return (
        <div
          className={classNames(
            "user-div d-flex justify-content-center justify-content-md-start p-3",
            {
              "bg-white": selected,
            }
          )}
          role="button"
          key={user.id}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_USER", payload: user.id })
          }
        >
          <Image
            src={
              user.imageUrl ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            roundedCircle
            className="user-image"
          />
          <div className="d-none d-md-block ml-2">
            <p className="text-success">{user.username}</p>
            <p className="font-weight-light">
              {user.latestMessage
                ? user.latestMessage.content
                : "You are now connected"}
            </p>
          </div>
        </div>
      );
    });
  }

  return (
    <Col xs={2} md={4} className="p-0 bg-light">
      {usersMarkup}
    </Col>
  );
};

export default Users;
