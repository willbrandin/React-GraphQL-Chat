import React from "react";
import classNames from "classnames";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useAuthState } from "../../context/auth";
import moment from "moment";

const Message = ({ message }) => {
  const { user } = useAuthState();
  const sent = message.from === user.id;
  const received = !sent;

  return (
    <OverlayTrigger
      placement={received ? "right" : "left"}
      overlay={
        <Tooltip>
          {moment(message.createdAt).format("MMMM DD, YYYY @ h:mm a")}
        </Tooltip>
      }
      transition={false}
    >
      <div
        className={classNames("d-flex my-3", {
          "ml-auto": sent,
          "mr-auto": received,
        })}
      >
        <div
          className={classNames("py-2 px-3 rounded-pill", {
            "bg-primary": sent,
            "bg-secondary": received,
          })}
        >
          <p className="text-white">{message.content}</p>
        </div>
      </div>
    </OverlayTrigger>
  );
};

export default Message;
