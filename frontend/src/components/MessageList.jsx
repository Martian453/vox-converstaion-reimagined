import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

const MessageList = ({ messages }) => {
  const bottomRef = useRef(null);
  const { authUser } = useAuthStore();

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {messages.map((msg) => {
        const isOwn = msg.senderId === authUser?._id || msg.isOwn;
        const displayText = isOwn
          ? msg.originalText
          : msg.translatedText || msg.originalText;

        return (
          <div
            key={msg._id}
            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-3 py-2 max-w-xs ${
                isOwn
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {/* Show text */}
              {displayText}

              {/* Show image if exists */}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="attachment"
                  className="mt-2 rounded-lg max-h-40"
                />
              )}
            </div>
          </div>
        );
      })}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
