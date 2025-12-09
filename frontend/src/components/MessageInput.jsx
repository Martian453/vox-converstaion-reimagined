// frontend/src/components/MessageInput.jsx
import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const sendMessage = useChatStore((state) => state.sendMessage);
  const selectedUser = useChatStore((state) => state.selectedUser);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Base64 preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !imagePreview) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Reset after sending
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Send error:", err);
      toast.error("Message could not be sent");
    }
  };

  return (
    <div className="p-3 border-t">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative w-32 mb-2">
          <img src={imagePreview} alt="preview" className="rounded-lg" />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input + buttons */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded px-3 py-2"
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 bg-gray-200 rounded"
        >
          <Image size={20} />
        </button>

        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 text-white rounded"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
