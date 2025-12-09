import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  setSelectedUser: (user) => set({ selectedUser: user }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data || [] });
    } catch (error) {
      console.error("Get users error:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    if (!userId) return;
    set({ isMessagesLoading: true });
    try {
      const { authUser } = useAuthStore.getState();
      const res = await axiosInstance.get(`/messages/${userId}`);
      const msgs = (res.data || []).map((msg) => ({
        ...msg,
        isOwn: msg.senderId === authUser?._id,
      }));
      set({ messages: msgs });
    } catch (error) {
      console.error("Get messages error:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async ({ text, image } = {}) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }
    const trimmed = (text || "").trim();
    if (!trimmed && !image) return;

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        text: trimmed,
        image,
      });

      const msg = {
        ...res.data,
        isOwn: res.data.senderId === authUser?._id,
      };

      set((state) => ({ messages: [...state.messages, msg] }));
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || "Message could not be sent");
    }
  },

  addMessage: (msg) => {
    set((state) => ({
      messages: [...state.messages, msg],
    }));
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === id ? { ...m, ...updates } : m
      ),
    }));
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageUpdated");

    socket.on("newMessage", (incoming) => {
      const { selectedUser } = get();
      const { authUser } = useAuthStore.getState();
      const incSenderId = String(incoming.senderId);
      const incReceiverId = String(incoming.receiverId);
      const selectedId = selectedUser ? String(selectedUser._id) : null;
      const myId = String(authUser?._id);

      if (
        selectedUser &&
        (incSenderId === selectedId || incReceiverId === selectedId)
      ) {
        const msg = {
          ...incoming,
          senderId: incSenderId,
          receiverId: incReceiverId,
          isOwn: incSenderId === myId,
        };
        get().addMessage(msg);
      } else {
        console.log("New message from another user:", incoming);
      }
    });

    socket.on("messageUpdated", (updated) => {
      get().updateMessage(updated._id, updated);
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
      socket.off("messageUpdated");
    }
  },
}));
