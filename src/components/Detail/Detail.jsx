import React, { useState, useEffect } from "react";
import { ChevronDown, Download, Ban, LogOut } from "lucide-react";
import { auth, db } from "../../firebase/firebase";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function Option({ title, isOpen, onToggle, children }) {
  return (
    <div className="option">
      <button
        className="w-full flex items-center justify-between cursor-pointer py-3 px-5 hover:bg-[#111928] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-white">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-white transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ${
          isOpen ? "max-h-96 mt-5 px-5" : "max-h-0"
        }`}
      >
        {isOpen && <div className="content">{children}</div>}
      </div>
    </div>
  );
}

function PhotoItem({ src, name }) {
  return (
    <div className="photoItem flex items-center justify-between bg-[#111928] p-4 rounded-lg hover:bg-[#1F2937] transition-colors">
      <div className="photoDetail flex items-center gap-5">
        <img
          src={src}
          alt={name}
          className="w-10 h-10 rounded-md object-cover"
        />
        <span className="text-sm text-white font-light">{name}</span>
      </div>
      <button
        aria-label={`Download ${name}`}
        className="flex-shrink-0 p-2 bg-transparent hover:bg-[#1F2937] transition-colors rounded-full"
        onClick={() => {
          // Create an anchor element
          const link = document.createElement("a");
          link.href = src;
          link.download = name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      >
        <Download className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}

function Button({ label, bgColor, hoverColor, onClick, icon, disabled }) {
  return (
    <button
      className={`px-5 py-2 flex items-center gap-2 border-none rounded cursor-pointer transition-colors mt-3 ${bgColor} hover:${hoverColor} focus:outline-none focus:ring-2 focus:ring-white ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Detail() {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [privacyHelpOpen, setPrivacyHelpOpen] = useState(false);
  const [sharedPhotosOpen, setSharedPhotosOpen] = useState(true);
  const [sharedFilesOpen, setSharedFilesOpen] = useState(false);
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [blockStatus, setBlockStatus] = useState({
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch shared photos from chat messages
  useEffect(() => {
    if (chatId) {
      const fetchPhotos = async () => {
        try {
          const chatDoc = await getDoc(doc(db, "chats", chatId));
          if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            const photosFromMessages = chatData.messages
              .filter((msg) => msg.img)
              .map((msg, index) => ({
                src: msg.img,
                name: `Image_${index + 1}.jpg`,
                date: msg.createdAt,
              }));

            setSharedPhotos(photosFromMessages);
          }
        } catch (error) {
          console.error("Error fetching shared photos:", error);
        }
      };

      fetchPhotos();
    }
  }, [chatId]);

  // Check block status on component mount and when user changes
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!currentUser || !user) return;

      try {
        // Get current user's document to check if they've blocked the other user
        const currentUserDoc = await getDoc(doc(db, "users", currentUser.id));

        // Get the other user's document to check if they've blocked the current user
        const otherUserDoc = await getDoc(doc(db, "users", user.id));

        if (currentUserDoc.exists() && otherUserDoc.exists()) {
          const currentUserData = currentUserDoc.data();
          const otherUserData = otherUserDoc.data();

          const blockedByCurrentUser =
            currentUserData.blocked &&
            currentUserData.blocked.includes(user.id);

          const blockedByOtherUser =
            otherUserData.blocked &&
            otherUserData.blocked.includes(currentUser.id);

          setBlockStatus({
            isReceiverBlocked: blockedByCurrentUser,
            isCurrentUserBlocked: blockedByOtherUser,
          });
        }
      } catch (error) {
        console.error("Error checking block status:", error);
      }
    };

    checkBlockStatus();
  }, [currentUser, user]);

  const handleBlock = async () => {
    if (!user || !currentUser || isLoading) return;

    setIsLoading(true);
    try {
      const currentUserRef = doc(db, "users", currentUser.id);
      const currentUserDoc = await getDoc(currentUserRef);

      if (currentUserDoc.exists()) {
        const userData = currentUserDoc.data();
        const blockedUsers = userData.blocked || [];
        const isBlocked = blockedUsers.includes(user.id);

        // Toggle blocked status
        if (isBlocked) {
          // Unblock user
          await updateDoc(currentUserRef, {
            blocked: arrayRemove(user.id),
          });
        } else {
          // Block user
          await updateDoc(currentUserRef, {
            blocked: arrayUnion(user.id),
          });
        }

        // Update local state
        setBlockStatus((prev) => ({
          ...prev,
          isReceiverBlocked: !isBlocked,
        }));

        // Update global state if needed
        if (changeBlock) {
          changeBlock();
        }
      }
    } catch (error) {
      console.error("Error updating block status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBlockButtonLabel = () => {
    if (blockStatus.isCurrentUserBlocked) {
      return "You are blocked";
    } else if (blockStatus.isReceiverBlocked) {
      return "Unblock user";
    } else {
      return "Block user";
    }
  };

  return (
    <div className="flex-[1] overflow-y-auto bg-[#1F2937] text-white">
      {/* User Information */}
      <div className="user px-7 py-5 flex flex-col items-center gap-4 border-b border-[#111928]">
        <img
          src={user?.avatar || "./avatar.jpg"}
          alt="User Avatar"
          className="w-24 h-24 object-cover rounded-full border-2 border-[#111928]"
        />
        <h2 className="text-white text-xl">{user?.name || "User"}</h2>
        <p className="text-[#576CA8] text-center">
          {user?.about || "Hey there, I am using SocketChat!!!"}
        </p>
      </div>

      {/* Options */}
      <div className="info p-5 flex flex-col gap-6">
        <Option
          title="Chat Settings"
          isOpen={chatSettingsOpen}
          onToggle={() => setChatSettingsOpen(!chatSettingsOpen)}
        >
          {/* Chat Settings content */}
          <p className="text-sm text-white opacity-80">
            Adjust your chat preferences here.
          </p>
          <div className="mt-3">
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" className="rounded" />
              Mute notifications
            </label>
          </div>
        </Option>

        <Option
          title="Privacy and Help"
          isOpen={privacyHelpOpen}
          onToggle={() => setPrivacyHelpOpen(!privacyHelpOpen)}
        >
          {/* Privacy and Help content */}
          <p className="text-sm text-white opacity-80 mb-3">
            Review your privacy settings or get assistance.
          </p>
          <p className="text-sm text-white opacity-80">
            Messages in this chat are end-to-end encrypted.
          </p>
        </Option>

        <Option
          title="Shared Photos"
          isOpen={sharedPhotosOpen}
          onToggle={() => setSharedPhotosOpen(!sharedPhotosOpen)}
        >
          <div className="photos flex flex-col gap-5">
            {sharedPhotos.length > 0 ? (
              sharedPhotos.map((photo, index) => (
                <PhotoItem key={index} src={photo.src} name={photo.name} />
              ))
            ) : (
              <p className="text-sm text-white opacity-80">
                No photos have been shared yet.
              </p>
            )}
          </div>
        </Option>

        <Option
          title="Shared Files"
          isOpen={sharedFilesOpen}
          onToggle={() => setSharedFilesOpen(!sharedFilesOpen)}
        >
          {/* Shared Files content */}
          <p className="text-sm text-white opacity-80">
            No files have been shared yet.
          </p>
        </Option>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <Button
            label={getBlockButtonLabel()}
            bgColor="bg-red-600"
            hoverColor="bg-red-700"
            onClick={handleBlock}
            icon={<Ban className="w-5 h-5 text-white" />}
            disabled={blockStatus.isCurrentUserBlocked || isLoading}
          />
          <Button
            label="Log out"
            bgColor="bg-blue-600"
            hoverColor="bg-blue-700"
            onClick={() => auth.signOut()}
            icon={<LogOut className="w-5 h-5 text-white" />}
          />
        </div>
      </div>
    </div>
  );
}

export default Detail;
