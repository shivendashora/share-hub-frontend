'use client'
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Phone, Video, MoreHorizontal } from "lucide-react";
import { socket } from "@/utils/socket";

type Message = {
  id: number;
  text: string;
  sender: "me" | "them";
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
};

export default function ChatInterface({ selectedUser, roomId }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId);
  }, [roomId]);

  useEffect(() => {
    socket.on("sendMessage", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: msg.message,
          sender: "them",
          user: msg.user
        }
      ]);
    });

    return () => {
      socket.off("sendMessage");
    };
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      user: {
        id: selectedUser.id,
        name: selectedUser.userName,
        avatar: selectedUser.image 
      }
    };

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: messageData.message,
        sender: "me",
        user: messageData.user
      }
    ]);

    socket.emit("sendMessage", {
      roomId,
      ...messageData
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            {selectedUser.image ? (
              <img
                src={selectedUser.image}
                alt={selectedUser.userName[0].toUpperCase()}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {selectedUser.userName[0].toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{selectedUser.userName}</p>
            <p className="text-xs text-emerald-500 font-medium">Active now</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[Phone, Video, MoreHorizontal].map((Icon, i) => (
            <button
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            {/* Avatar for "them" - shown on the left */}
            {msg.sender === "them" && (
              <div className="flex-shrink-0">
                {msg.user.avatar ? (
                  <img
                    src={msg.user.avatar}
                    alt={msg.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {msg.user.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}

            <div
              className={`min-w-[150px] px-4 py-2.5 rounded-2xl text-sm leading-relaxed px-4 py-2.5 rounded-2xl text-sm flex flex-col gap-2  ${msg.sender === "me"
                  ? "bg-indigo-500 text-white rounded-br-sm shadow-sm shadow-indigo-100"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
                }`}
            >

              <div className={`w-[100%] border-b-1 ${msg.sender === "me" ? "text-white border-white":"text-black border-black"}`}>
                <span className="text-[10px]"> 
                  {msg.user.name}
                </span>
              </div>
              <div>
                {msg.text}
              </div>
              
            </div>

            {/* Avatar for "me" - shown on the right */}
            {msg.sender === "me" && (
              <div className="flex-shrink-0">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                    {selectedUser.userName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-indigo-300 focus-within:bg-white transition-colors">
          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <Paperclip size={17} />
          </button>
          <input
            type="text"
            className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="w-7 h-7 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0 disabled:opacity-40"
            disabled={!newMessage.trim()}
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}