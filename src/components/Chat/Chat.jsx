import React, { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  Phone,
  Video,
  Info,
  Image,
  Camera,
  Mic,
  Smile,
  Send,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";

function Chat() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [showOptions, setShowOptions] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { chatId, user, isCurrentUserBlocked, isReciverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };
  const endRef = useRef(null);
  const messagesRef = useRef(null);

  // Automatically scroll to the latest message when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "socketchat");
    setIsUploading(true);

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/drusgejhw/image/upload",
        {
          method: "POST",
          body: data,
        }
      );
      const fileData = await res.json();
      setImageURL(fileData.secure_url);
      setIsUploading(false);
      return fileData.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      setIsUploading(false);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const handleSend = async () => {
    if (text === "" && !imageURL) return;
    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text: text || "",
          img: imageURL || null,
          createdAt: new Date(),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userChats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (chat) => chat.chatId === chatId
          );
          userChatsData.chats[chatIndex].lastMessage = imageURL
            ? "📷 Image"
            : text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

      // Clear the text field and image URL after sending
      setText("");
      setImageURL("");
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = date.toDate ? date.toDate() : new Date(date);
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get user status
  const getUserStatus = () => {
    if (!user) return "Offline";
    return user.isOnline
      ? "Online"
      : "Last seen " + formatLastSeen(user.lastActive);
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "recently";

    const now = new Date();
    const lastActive = new Date(timestamp);
    const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  };

  // Cancel image upload
  const cancelUpload = () => {
    setImageURL("");
  };

  return (
    <div className="flex-[2] h-full flex flex-col bg-[#1F2937] text-white rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-[#111928] border-b border-[#dddddd20]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.avatar || "./avatar.png"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#5183fe]"
            />
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 ${
                user?.isOnline ? "bg-green-500" : "bg-gray-400"
              } rounded-full border-2 border-[#111928]`}
            ></div>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">
              {user?.name || "Loading..."}
            </span>
            <span className="text-xs text-[#a5a5a5]">{getUserStatus()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone className="h-5 w-5 text-[#a5a5a5] hover:text-white cursor-pointer transition-colors" />
          <Video className="h-5 w-5 text-[#a5a5a5] hover:text-white cursor-pointer transition-colors" />
          <div className="relative">
            <MoreHorizontal
              className="h-5 w-5 text-[#a5a5a5] hover:text-white cursor-pointer transition-colors"
              onClick={() => setShowOptions(!showOptions)}
            />
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-[#111928] border border-[#dddddd20] rounded-md shadow-lg z-10">
                <ul className="py-1">
                  <li className="px-4 py-2 hover:bg-[#2d3748] cursor-pointer">
                    View Profile
                  </li>
                  <li className="px-4 py-2 hover:bg-[#2d3748] cursor-pointer">
                    Search in Conversation
                  </li>
                  <li className="px-4 py-2 hover:bg-[#2d3748] cursor-pointer">
                    Mute Notifications
                  </li>
                  <li className="px-4 py-2 hover:bg-[#2d3748] cursor-pointer text-red-400">
                    Block User
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-[#5183fe] scrollbar-track-[#111928]"
        style={{ backgroundColor: "#111928" }}
      >
        {chat?.messages?.map((message, index) => {
          const isOwn = message.senderId === currentUser.id;
          return (
            <div
              key={index}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] ${
                  isOwn
                    ? "bg-[#5183fe] rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                    : "bg-[#374151] rounded-tl-lg rounded-tr-lg rounded-br-lg"
                }`}
              >
                {message.img && (
                  <img
                    src={message.img}
                    alt="img"
                    className="w-full h-auto rounded-t-lg object-cover"
                  />
                )}
                <div className="p-3 break-words">
                  <p className="text-sm">{message.text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      isOwn ? "text-blue-100" : "text-gray-400"
                    } text-right`}
                  >
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}></div>
      </div>

      {/* Image Preview */}
      {imageURL && (
        <div className="bg-[#1a202c] p-2">
          <div className="relative inline-block">
            <img
              src={imageURL}
              alt="Upload preview"
              className="h-24 rounded-md object-cover"
            />
            <button
              onClick={cancelUpload}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 bg-[#111928] border-t border-[#dddddd20]">
        {isUploading && (
          <div className="mb-2 text-center text-sm text-blue-300">
            Uploading image...
          </div>
        )}
        <div className="flex items-center bg-[#1F2937] rounded-lg p-1">
          <div className="flex gap-2 px-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              className="text-[#a5a5a5] hover:text-white p-2 rounded-full hover:bg-[#374151] transition-colors"
              onClick={() => fileInputRef.current.click()}
            >
              <Image className="h-5 w-5" />
            </button>
            <button className="text-[#a5a5a5] hover:text-white p-2 rounded-full hover:bg-[#374151] transition-colors">
              <Mic className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                className="text-[#a5a5a5] hover:text-white p-2 rounded-full hover:bg-[#374151] transition-colors"
                onClick={() => setOpen(!open)}
              >
                <Smile className="h-5 w-5" />
              </button>
              {open && (
                <div className="absolute bottom-12 left-0 z-10">
                  <EmojiPicker onEmojiClick={handleEmoji} theme="dark" />
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            placeholder={
              isCurrentUserBlocked ? "You are blocked" : "Type a message"
            }
            value={text}
            className="flex-1 bg-transparent border-none outline-none p-3 text-white"
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          <button
            className={`p-2 rounded-full ${
              text.trim() || imageURL
                ? "bg-[#5183fe] text-white cursor-pointer hover:bg-[#4269cc]"
                : "bg-[#374151] text-[#a5a5a5] cursor-not-allowed"
            } transition-colors`}
            disabled={!text.trim() && !imageURL}
            onClick={handleSend}
          >
            <Send
              className="w-5 h-5 "
              disabled={isCurrentUserBlocked || isReciverBlocked}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
