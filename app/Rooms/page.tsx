'use client'
import { useEffect, useState } from "react";
import UserCard from "../components/Rooms/user-card";
import ChatInterface from "../components/Rooms/chat-interface";
import { Search, Edit, LogOut } from "lucide-react";
import ApiFetch from "@/utils/api-fetch";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const usersData = [
  { id: 1, name: "Shiven", lastMessage: "Hey bro!", time: "10:45 AM", unread: 2 },
  { id: 2, name: "Rahul", lastMessage: "Let's meet tomorrow", time: "09:30 AM" },
  { id: 3, name: "Ananya", lastMessage: "Sent the files ✅", time: "Yesterday" },
  { id: 4, name: "Priya", lastMessage: "Can you review this?", time: "Yesterday" },
];

export default function Rooms() {
  const [selectedUser, setSelectedUser] = useState(usersData[0]);
  const [search, setSearch] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([])
  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("roomId");
  const router = useRouter();
  const { get, cheking } = ApiFetch()

  const filtered = users.filter((u) =>
    u.userName.toLowerCase().includes(search.toLowerCase())
  );

  const fetchRoomInfo = async () => {
    let finalRoomId = queryRoomId;


    if (finalRoomId) {
      router.replace(`?roomId=${finalRoomId}`);
    } else {
      const room = await get("http://localhost:3001/rooms/createRoomForUser");
      finalRoomId = room?.roomId;

      if (finalRoomId) {
        router.replace(`?roomId=${finalRoomId}`);
      }
    }

    if (finalRoomId) {
      setRoomId(finalRoomId);

      const usersResponse = await get(
        `http://localhost:3001/rooms/getMembers/${finalRoomId}`
      );

      const mapped = usersResponse?.mappedUsers ?? [];
      setUsers(mapped);

      if (mapped.length > 0) {
        setSelectedUser(mapped[0]);
      }
    }
  };

  const handleLogout = async () => {

    try {

      const response = await get(`http://localhost:3001/auth/logoutuser/${roomId}`);
      Cookies.remove("bearerToken");
      router.push("/Auth");
    }
    catch (e: any) {
      console.error(e);
    }


  };

  useEffect(() => {
    fetchRoomInfo()
  }, [])

  if (cheking) {
    return (
      <div className="h-[calc(100vh-34px)] flex items-center justify-center">
        <span className="text-sm text-gray-300">
          Can't load room user yet Not authenticated
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-row h-[calc(100vh-34px)] gap-3 p-3 bg-gray-100">
      {/* Sidebar */}
      <div className="w-[30%] bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl flex flex-col">
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Messages</h2>
          <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <Edit size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Room label */}
        <div className="px-5 pb-2 flex flex-row justify-between items-center">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            Chats · Room {roomId}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isActive={selectedUser.id === user.id}
              onClick={() => setSelectedUser(user)}
            />
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="w-[70%]">
        <ChatInterface selectedUser={selectedUser} />
      </div>
    </div>
  );
}