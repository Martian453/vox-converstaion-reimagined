import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
  const {
    selectedUser,
    getMessages,
    messages,
    addMessage,
    updateMessage,
  } = useChatStore();

  const socket = useAuthStore((s) => s.socket);

  // 🔌 Subscribe to socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      addMessage(msg);
    };

    const handleMessageUpdated = ({ id, translatedText }) => {
      updateMessage(id, { translatedText });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageUpdated", handleMessageUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageUpdated", handleMessageUpdated);
    };
  }, [socket, addMessage, updateMessage]);

  // 📥 Load messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-center text-zinc-400">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`p-2 rounded-lg max-w-xs ${
                msg.senderId === selectedUser._id
                  ? "bg-gray-200 self-start"
                  : "bg-blue-500 text-white self-end"
              }`}
            >
              {/* ✅ Show translated text if available, else original */}
              <p>{msg.translatedText || msg.originalText}</p>

              {msg.image && (
                <img
                  src={msg.image}
                  alt="attachment"
                  className="mt-2 rounded-lg max-h-48"
                />
              )}
            </div>
          ))
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
