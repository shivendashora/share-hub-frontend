'use client'

import { useEffect, useEffectEvent, useRef, useState, type ChangeEvent } from "react";
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreHorizontal,
  UserCog,
  ArrowLeft
} from "lucide-react";
import { socket } from "@/utils/socket";
import ApiFetch from "@/utils/api-fetch";
import { useRouter } from "next/navigation";
import { useApi } from "@/context/api-context";
import Cookies from "js-cookie";

type MessageSender = "me" | "them";

interface ChatUser {
  id: number;
  userName: string;
  image?: string;
}

interface ChatInterfaceProps {
  selectedUser: ChatUser;
  roomId: string;
}

interface Message {
  id: number;
  text: string;
  sender: MessageSender;
  fileName?: string;
  fileUrl?: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
}

interface ChatRecord {
  id: number;
  text?: string;
  chats?: string;
  userId: number;
  userName: string;
  avatar?: string;
  fileName?: string;
  fileUrl?: string;
}

interface GetRoomChatsResponse {
  response?: {
    data?: ChatRecord[];
  };
}

interface UploadRoomFileResponse {
  fileName?: string;
  fileUrl?: string;
  message?: string;
}

interface IncomingSocketMessage {
  message: string;
  user: Message["user"];
  fileName?: string;
  fileUrl?: string;
}

function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) return `${sizeInBytes} B`;
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ChatInterface({
  selectedUser,
  roomId,
}: Readonly<ChatInterfaceProps>) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isUploadPopoverOpen, setIsUploadPopoverOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { setLoading } = useApi();

  const router = useRouter();

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPopoverRef = useRef<HTMLDivElement>(null);

  const { post, postForm } = ApiFetch();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isUploadPopoverOpen) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        uploadPopoverRef.current &&
        event.target instanceof Node &&
        !uploadPopoverRef.current.contains(event.target)
      ) {
        setIsUploadPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [isUploadPopoverOpen]);

  const fetchInitialChatMessages = async (activeRoomId: string) => {
    try {
      const chats = (await post("http://localhost:3001/rooms/getRoomChats", {
        roomId: activeRoomId,
      })) as GetRoomChatsResponse | undefined;

      const roomChats = Array.isArray(chats?.response?.data)
        ? chats.response.data
        : [];

      const formattedMessages: Message[] = roomChats.map((chat) => ({
        id: chat.id,
        text: chat.text || chat.chats || "",
        sender: chat.userId === selectedUser.id ? "me" : "them",
        fileName: chat.fileName,
        fileUrl: chat.fileUrl,
        user: {
          id: chat.userId,
          name: chat.userName,
          avatar: chat.avatar || "",
        },
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error(error);
    }
  };

  const loadInitialChatMessages = useEffectEvent((activeRoomId: string) => {
    void fetchInitialChatMessages(activeRoomId);
  });

  useEffect(() => {
    if (!roomId) return;

    loadInitialChatMessages(roomId);
    socket.emit("joinRoom", roomId);

    const handleMessage = (message: IncomingSocketMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: message.message,
          sender: "them",
          fileName: message.fileName,
          fileUrl: message.fileUrl,
          user: message.user,
        },
      ]);
    };

    socket.on("sendMessage", handleMessage);

    return () => {
      socket.off("sendMessage", handleMessage);
    };
  }, [roomId, selectedUser.id]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      message: newMessage,
      user: {
        id: selectedUser.id,
        name: selectedUser.userName,
        avatar: selectedUser.image,
      },
    };

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: messageData.message,
        sender: "me",
        user: messageData.user,
      },
    ]);

    socket.emit("sendMessage", {
      roomId,
      ...messageData,
    });

    setNewMessage("");
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadMessage(null);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadMessage("Choose a file first.");
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("roomId", roomId);

      const response = (await postForm(
        "http://localhost:3001/rooms/uploadRoomFile",
        formData
      )) as UploadRoomFileResponse | undefined;

      const uploadedFileName = response?.fileName || selectedFile.name;
      const uploadedFileUrl = response?.fileUrl;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: uploadedFileName,
          sender: "me",
          fileName: uploadedFileName,
          fileUrl: uploadedFileUrl,
          user: {
            id: selectedUser.id,
            name: selectedUser.userName,
            avatar: selectedUser.image,
          },
        },
      ]);

      setUploadMessage(response?.message || "File uploaded successfully.");
      setSelectedFile(null);
      setIsUploadPopoverOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setUploadMessage("File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await post("http://localhost:3001/auth/logoutuser/", {
        roomId: roomId
      });
      Cookies.remove("bearerToken");
      router.push("/Auth");
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () => {
    handleLogout();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Avatar */}
          <div className="relative">
            {selectedUser.image ? (
              <img
                src={selectedUser.image}
                alt={selectedUser.userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                {selectedUser.userName[0].toUpperCase()}
              </div>
            )}

            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>

          {/* Name */}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {selectedUser.userName}
            </p>
            <p className="text-xs text-emerald-500 font-medium">
              Active now
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {[Phone, Video, MoreHorizontal].map((Icon, index) => (
            <button
              key={index}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Icon size={16} />
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              router.push(`/user-profile?from=chat&roomId=${roomId}`)
            }
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <UserCog size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/60">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${message.sender === "me"
              ? "justify-end"
              : "justify-start"
              }`}
          >
            <div
              className={`min-w-[150px] rounded-2xl px-4 py-2.5 text-sm ${message.sender === "me"
                ? "bg-indigo-500 text-white"
                : "bg-white border border-gray-100 text-gray-800"
                }`}
            >
              {message.fileUrl ? (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {message.fileName || message.text}
                </a>
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2">
          <button
            type="button"
            onClick={() =>
              setIsUploadPopoverOpen((prev) => !prev)
            }
            className="text-gray-400 hover:text-gray-600"
          >
            <Paperclip size={17} />
          </button>

          <input
            type="text"
            placeholder="Write a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSend()
            }
            className="flex-1 bg-transparent outline-none text-sm"
          />

          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-7 h-7 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}