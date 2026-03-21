import ApiFetch from "@/utils/api-fetch";
import { useEffect, useState } from "react";

interface Room {
  id: number;
  name: string;
  description?: string;
  userId: number;
  isAdmin: boolean;
  memberCount?: number;
  createdAt?: string;
  isPrivate?: boolean;
}

interface RoomTableProps {
  token: string;
}

export default function RoomTable({ token }: Readonly<RoomTableProps>) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const { post } = ApiFetch();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const data = await post("/api/room/getAllRoomsCreatedByUser", {});

      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (roomId: number) => {
    setJoiningId(roomId);

    try {
      await post(`/api/room/join/${roomId}`, {});

      setJoinedIds((prev) => {
        const updated = new Set(prev);
        updated.add(roomId);
        return updated;
      });

    } catch (err) {
      console.error(err);
    } finally {
      setJoiningId(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);


  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase mb-1">
          My Workspace
        </p>
        <h1 className="text-2xl font-bold text-white">My Rooms</h1>
        <p className="text-sm text-gray-400 mt-1">
          {rooms.length} room{rooms.length === 1 ? "" : "s"} created by you
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-950">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Members
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Visibility
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              // ✅ Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 bg-gray-700 rounded w-48"></div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 bg-gray-700 rounded w-12"></div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 bg-gray-700 rounded-full w-16"></div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-9 bg-gray-700 rounded w-28"></div>
                  </td>
                </tr>
              ))
            ) : rooms.length === 0 ? (
              // ✅ Empty state
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
                      🚪
                    </div>
                    <p className="text-gray-400 text-sm">No rooms found</p>
                  </div>
                </td>
              </tr>
            ) : (
              // ✅ Actual data
              rooms.map((room) => {
                const isJoined = joinedIds.has(room.id);
                const isJoining = joiningId === room.id;

                return (
                  <tr key={room.id} className="hover:bg-gray-800/40">
                    <td className="px-5 py-4">{room.name}</td>

                    <td className="px-5 py-4 text-gray-400">
                      {room.description || "No description"}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {room.memberCount ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {room.isPrivate ? "🔒 Private" : "🌐 Public"}
                    </td>

                    <td className="px-5 py-4">
                      {room.isAdmin ? "⭐ Admin" : "Member"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isJoined ? (
                        <span className="text-green-400">✓ Joined</span>
                      ) : (
                        <button
                          onClick={() => handleJoin(room.id)}
                          disabled={isJoining}
                          className="px-4 py-2 bg-indigo-600 text-white rounded"
                        >
                          {isJoining ? "Joining..." : "Join Room"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}