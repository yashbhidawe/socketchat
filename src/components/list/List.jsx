import React from "react";
import UserInfo from "../UserInfo/UserInfo";
import ChatList from "../ChatList/ChatList";

function List() {
  return (
    <div className="flex flex-col h-full">
      {/* User profile section */}
      <div className="flex-shrink-0 border-b border-gray-800">
        <UserInfo />
      </div>

      {/* Chat list section with scroll */}
      <div className="flex-1 overflow-y-auto">
        <ChatList />
      </div>
    </div>
  );
}

export default List;
