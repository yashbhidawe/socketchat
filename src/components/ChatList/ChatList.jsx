import React, { useEffect, useState } from "react";
import { Search, Plus, Minus, UserPlus } from "lucide-react";
import AddUser from "./AddUser/AddUser";
import { useUserStore } from "../../store/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useChatStore } from "../../store/chatStore";

function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();
  console.log(chatId);

  // In the useEffect
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userChats", currentUser.id), // Note the capital C
      async (res) => {
        if (!res.exists()) {
          console.log("No chats found for this user.");
          setChats([]);
          return;
        }

        const items = res.data().chats || [];
        const promises = items.map(async (item) => {
          // Import getDoc at the top: import { getDoc } from "firebase/firestore";
          const userDocRef = doc(db, "users", item.reciverId); // Use reciverId instead of id
          const userDocSnap = await getDoc(userDocRef); // Use getDoc here

          if (!userDocSnap.exists()) {
            console.warn(`User document ${item.reciverId} not found.`);
            return null;
          }

          return {
            ...item,
            user: userDocSnap.data(),
            chatId: item.chatId, // Make sure chatId is in correct case
          };
        });

        const chatData = (await Promise.all(promises)).filter(Boolean);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser.id]);
  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userChats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
    } catch (error) {
      console.error(error);
    }
    changeChat(chat.chatId, chat.user);
  };
  const filteredChats = chats.filter((chat) =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="relative  flex flex-col h-full bg-gray-800">
      {/* Search and Add Section */}
      <div className="p-4 bg-gray-900 shadow-lg">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 focus-within:ring-2 ring-gray-600">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="bg-transparent w-full text-white placeholder-gray-400 focus:outline-none"
            />
          </div>

          {/* Add User Toggle Button */}
          <button
            onClick={() => setAddMode((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors ${
              addMode
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
            aria-label={addMode ? "Cancel adding user" : "Add new user"}
          >
            {addMode ? (
              <Minus className="w-5 h-5 text-white" />
            ) : (
              <UserPlus className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat?.chatId}
            onClick={() => handleSelect(chat)}
            className={`${
              chat.isSeen ? "bg-transparent" : "bg-[#5183fe]"
            } flex items-center p-4 cursor-pointer gap-4 border-b border-gray-700 hover:bg-gray-900 transition-colors`}
          >
            {/* Avatar with Online Status */}
            <div className="relative">
              <img
                src={
                  chat.user.blocked.includes(currentUser.id)
                    ? "./avtar.png"
                    : chat.user.avatar || "./avatar.png"
                }
                alt={`${chat.user.name}'s avatar`}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700"
              />
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-white truncate">
                  {chat.user.blocked.includes(currentUser.id)
                    ? "Blocked User"
                    : chat.user.name}{" "}
                </h3>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(chat.updatedAt).toLocaleTimeString()}{" "}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {addMode && (
        <div
          className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setAddMode(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <AddUser onClose={() => setAddMode(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatList;
