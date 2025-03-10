import React from "react";
import { MoreHorizontal, Video, Settings } from "lucide-react";
import { useUserStore } from "../../store/userStore";

function UserInfo() {
  const { currentUser } = useUserStore();
  return (
    <div className="flex flex-col bg-gray-800">
      {/* Logo */}
      <div className="flex justify-center py-2 bg-gray-900">
        <div className="text-xl font-bold tracking-wider">
          <span className="text-blue-400">Socket</span>
          <span className="text-white">Chat</span>
          <span className="ml-1 text-xs align-top text-blue-300">⚡</span>
        </div>
      </div>

      {/* User Info Section */}
      <div className="p-4 flex justify-between items-center">
        {/* User Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar || "https://i.pravatar.cc/150?img=68"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-700"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
          </div>
          <div>
            <h2 className="font-semibold text-white">
              {currentUser.name.slice(0, 5) + "..."}
            </h2>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Video Call"
          >
            <Video size={20} className="text-gray-300" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} className="text-gray-300" />
          </button>
          <button
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            aria-label="More Options"
          >
            <MoreHorizontal size={20} className="text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
