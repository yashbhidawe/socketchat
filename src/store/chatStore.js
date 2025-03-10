import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useUserStore } from "./userStore";
export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: null,
  isReciverBlocked: null,
  isLoading: true,
  changeChat: (chatId, user) => {
    const currentUser = useUserStore.getState().currentUser;

    //Check if the user is blocked
    if (user.blocked.includes(currentUser.uid)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isLoading: false,
        isReciverBlocked: false,
      });
    }
    //Check if the reciver is blocked
    else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: false,
        isLoading: false,
        isReciverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isLoading: false,
        isReciverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({ ...state, isReciverBlocked: !state.isReciverBlocked }));
  },
}));
