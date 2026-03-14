'use client'
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Phone, Video, MoreHorizontal } from "lucide-react";

export default function ChatInterface({ selectedUser }: any) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello 👋", sender: "them" },
    { id: 2, text: "Hi! How are you?", sender: "me" },
    { id: 3, text: "I'm doing great, thanks for asking!", sender: "them" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([...messages, { id: Date.now(), text: newMessage, sender: "me" }]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser.image || `https://i.pravatar.cc/100?u=${selectedUser.id}`}
              alt={selectedUser.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{selectedUser.name}</p>
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
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[60%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.sender === "me"
                  ? "bg-indigo-500 text-white rounded-br-sm shadow-sm shadow-indigo-100"
                  : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.text}
            </div>
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