import React, { useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import { useUserStore } from "../../../store/userStore";
function AddUser({ onClose }) {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      // Fetch user data
      const userRef = collection(db, "users");
      const q = query(
        userRef,
        where("nameLowercase", ">=", username.toLowerCase()),
        where("nameLowercase", "<", username.toLowerCase() + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");
    try {
      const newChatref = doc(chatRef);
      await setDoc(newChatref, {
        createdAt: serverTimestamp(),
        messages: [],
      });
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatref.id,
          lastMessage: "",
          reciverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatref.id,
          lastMessage: "",
          reciverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="relative p-6 bg-[#111928] rounded-lg shadow-lg w-full max-w-md mx-auto">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
        aria-label="Close Add User modal"
      >
        &times;
      </button>

      <h2 className="text-xl font-semibold text-white mb-4">Add User</h2>

      <form action="" className="flex gap-3 mb-6" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="flex-1 p-3 rounded-lg bg-[#1F2937] text-white placeholder-gray-400 border border-[#111928] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
        />
        <button
          type="submit"
          className="p-3 rounded-lg bg-[#1a73e8] text-white transition-colors hover:bg-[#1660c3] focus:outline-none"
        >
          Search
        </button>
      </form>

      {user && (
        <div className="user flex items-center justify-between">
          <div className="detail flex items-center gap-3">
            <img
              src={user.photoURL || "./avatar.png"}
              alt="Jane Doe"
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-white">{user.name}</span>
          </div>
          <button
            className="p-2 rounded-lg bg-[#0e57b6] text-white transition-colors hover:bg-[#0c4293] focus:outline-none"
            onClick={handleAdd}
          >
            Add user
          </button>
        </div>
      )}
    </div>
  );
}

export default AddUser;
