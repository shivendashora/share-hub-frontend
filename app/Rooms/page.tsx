'use client'
import { useEffect, useState } from "react";
import UserCard from "../components/Rooms/user-card";
import ChatInterface from "../components/Rooms/chat-interface";
import { Search, Edit, LogOut } from "lucide-react";
import ApiFetch from "@/utils/api-fetch";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useApi } from "@/context/api-context";
import { jwtDecode } from "jwt-decode";

export default function Rooms() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const searchParams = useSearchParams();
  const queryRoomId = searchParams.get("roomId");
  const router = useRouter();
  const { get, cheking,post } = ApiFetch();
  const { setLoading } = useApi();

  const filtered = users.filter((u) =>
    (u.userName || u.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const fetchRoomInfo = async () => {
    setLoading(true);

    try {
      let finalRoomId = queryRoomId;

      // If roomId exists in query
      if (finalRoomId) {
        router.replace(`?roomId=${finalRoomId}`);
      } else {
        // Create room
        const room = await get("http://localhost:3001/rooms/createRoomForUser");
        finalRoomId = room?.roomId;

        if (finalRoomId) {
          router.replace(`?roomId=${finalRoomId}`);
        }
      }

      if (!finalRoomId) {
        throw new Error("Room ID not found or failed to create room");
      }

      setRoomId(finalRoomId);

      // Fetch users
      const usersResponse = await get(
        `http://localhost:3001/rooms/getMembers/${finalRoomId}`
      );

      const mapped = usersResponse?.mappedUsers ?? [];
      setUsers(mapped);



      if (mapped.length > 0) {
        const bearerToken = Cookies.get("bearerToken");
        if (!bearerToken) return;

        const decoded: any = jwtDecode(bearerToken);
        const currentUser = mapped.find(
          (user: any) => user.id === decoded.userId
        );
        setSelectedUser(currentUser || mapped[0]);
      }
    } catch (error: any) {
      console.error("Error fetching room info:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
    Implement polling for reguraly fetching records for users
    added cleanup 
  */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRoomInfo();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await post("http://localhost:3001/auth/logoutuser/",{
        roomId:roomId
      });
      Cookies.remove("bearerToken");
      router.push("/Auth");
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomInfo();
  }, []);

  if (cheking) {
    return (
      <div className="h-[calc(100vh-34px)] flex items-center justify-center">
        <span className="text-sm text-gray-300">
          Can't load room user yet Not authenticated
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-[calc(100vh-34px)] gap-3 p-3 bg-gray-100">
      {/* Sidebar */}
      <div className="w-[30%] bg-white border border-gray-100 shadow-sm overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Messages
          </h2>
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
              isActive={selectedUser?.id === user.id}
              onClick={() => setSelectedUser(user)}
            />
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="w-[70%]">
        {selectedUser && roomId && (
          <ChatInterface
            selectedUser={selectedUser}
            roomId={roomId}
          />
        )}
      </div>
    </div>
  );
}