'use client'

import { useEffect, useEffectEvent, useState } from "react";
import ApiFetch from "@/utils/api-fetch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/context/api-context";
import { LogOut, Settings } from "lucide-react";
import Cookies from "js-cookie";

interface Room {
    id: number;
    name: string;
    roomId: string;
    isAdmin: boolean;
    memberCount?: number;
    createdAt?: string;
    isPrivate?: boolean;
}

export default function RoomTable() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const { post,get } = ApiFetch();
    const { setLoading } = useApi();
    const router = useRouter();

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await get("http://localhost:3001/rooms/getAllRoomsCreatedByUser");
            const data = response ?? [];
            setRooms(Array.isArray(data) ? data : []);
        } catch (e: unknown) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchRooms = useEffectEvent(() => {
        void fetchRooms();
    });

    const handleCreateRoom = async () => {
        try {
            setLoading(true);
            const newRoom = await get("http://localhost:3001/rooms/createRoomForUser");
            if (newRoom) {
                setRooms((prev) => [newRoom, ...prev]);
            } else {
                await fetchRooms();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (roomId: string) => {
        router.push(`/Rooms?roomId=${roomId}`);
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await post(`http://localhost:3001/auth/logoutuser/`,{});
        } catch (e) {
            console.error(e);
        } finally {
            Cookies.remove("bearerToken");
            router.replace("/Auth");
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        handleFetchRooms();
    }, []);

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase mb-1">
                        My Workspace
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                        My Rooms
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {rooms.length} room{rooms.length === 1 ? "" : "s"} created by you
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Settings */}
                    <Link
                        href="/user-profile"
                        aria-label="Open profile settings"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors duration-150"
                    >
                        <Settings size={16} />
                    </Link>

                    {/* Logout — same size/shape as settings, turns red on hover */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        aria-label="Logout"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <LogOut size={16} />
                    </button>

                    {/* Create Room */}
                    <button
                        onClick={handleCreateRoom}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-colors duration-150"
                    >
                        + Create Room
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Room
                            </th>
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Visibility
                            </th>
                            <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Role
                            </th>
                            <th className="px-5 py-3.5" />
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-50">
                        {rooms.map((room) => (
                            <tr
                                key={room.roomId}
                                className="hover:bg-gray-50 transition-colors duration-150"
                            >
                                <td className="px-5 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800">
                                            {room.name || "Untitled Room"}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {room.roomId}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-5 py-4">
                                    {room.isPrivate ? (
                                        <span className="px-2.5 py-1 rounded-full text-xs bg-yellow-50 text-yellow-600 border border-yellow-200">
                                            🔒 Private
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full text-xs bg-green-50 text-green-600 border border-green-200">
                                            🌐 Public
                                        </span>
                                    )}
                                </td>

                                <td className="px-5 py-4">
                                    {room.isAdmin ? (
                                        <span className="px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-600 border border-indigo-200">
                                            ⭐ Admin
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-500 border border-gray-200">
                                            Member
                                        </span>
                                    )}
                                </td>

                                <td className="px-5 py-4 text-right">
                                    <button
                                        onClick={() => handleJoin(room.roomId)}
                                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-150"
                                    >
                                        Join Room
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}