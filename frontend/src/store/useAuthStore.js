// frontend/src/store/useAuthStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  socket: null,
  onlineUsers: [],

  setAuthUser: (user) => set({ authUser: user }),

  // Initialize socket connection safely
  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return;

    // cleanup old socket if exists
    if (socket) {
      socket.disconnect();
    }



    const newSocket = io(`http://${window.location.hostname}:5001`, {
      withCredentials: true,
      query: { userId: authUser._id }, // send userId to backend
    });

    set({ socket: newSocket });

    newSocket.emit("register", authUser._id);

    // Listen for online users
    newSocket.on("getOnlineUsers", (users) => {
      set({ onlineUsers: users });
    });
  },

  // Check if user is already authenticated
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isCheckingAuth: false });

      // connect socket once auth confirmed
      get().connectSocket();
    } catch {
      set({ authUser: null, isCheckingAuth: false });
    }
  },

  // Signup
  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", formData);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket(); // connect socket after signup
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Login
  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", formData);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket(); // connect socket after login
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Update preferred language
  updateLanguage: async (preferredLanguage) => {
    try {
      const res = await axiosInstance.put("/user/language", {
        preferredLanguage,
      });
      set((state) => ({
        authUser: {
          ...state.authUser,
          preferredLanguage: res.data.preferredLanguage,
        },
      }));
      toast.success("Language updated successfully");
    } catch (error) {
      console.error("Error updating language:", error);
      toast.error(error.response?.data?.message || "Language update failed");
    }
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      const { socket } = get();
      if (socket) socket.disconnect(); // ✅ close socket on logout
      set({ authUser: null, onlineUsers: [], socket: null });
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err.message);
      toast.error("Logout failed");
    }
  },
}));
