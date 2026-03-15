'use client'

import { useState, useRef } from "react";
import { ArrowRight, User, Camera } from "lucide-react";
import ApiFetch from "@/utils/api-fetch";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface GuestProfileSetupProps {
    mode: "guest" | "join";   // "guest" = just signup, "join" = signup then join room
    roomId?: string;          // required when mode === "join"
    onBack: () => void;
}

export default function GuestProfileSetup({ mode, roomId, onBack }: Readonly<GuestProfileSetupProps>) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { postForm, post } = ApiFetch();

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProfileFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
        const formData = new FormData();
        formData.append("isGuestUser", "true");
        if (username)    formData.append("username", username);
        if (email)       formData.append("email", email);
        if (profileFile) formData.append("profile", profileFile);
        if (mode === "join" && roomId) formData.append("roomId", roomId);

        const data = await postForm("http://localhost:3001/auth/signup", formData);

        if (!data?.token || !data?.userId) {
            setError("Signup failed. Please try again.");
            return;
        }

        Cookies.set("bearerToken", data.token);

        if (mode === "join") {
            // ✅ Raw fetch — uses fresh token directly, not the stale one in ApiFetch
            const joinRes = await fetch("http://localhost:3001/rooms/joinUserToRoom", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${data.token}`,  // fresh token
                },
                body: JSON.stringify({
                    roomId: String(roomId),
                    userId: data.userId,
                }),
            });

            if (!joinRes.ok) {
                const err = await joinRes.text();
                console.error("Join failed:", err);
                setError("Couldn't join room. Please check the room ID.");
                return;
            }

            router.push(`/Rooms?roomId=${roomId}`);
        } else {
            router.push(`/Rooms`);
        }

    } catch (e: any) {
        setError("Something went wrong. Please try again.");
        console.error(e);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="p-7">
            {/* Avatar picker */}
            <div className="flex flex-col items-center mb-6">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group"
                >
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={28} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera size={16} className="text-white" />
                    </div>
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />
                <p className="mt-2 text-xs text-gray-400">Click to add a photo</p>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4 mb-2">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="username" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Username
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="cooluser_42"
                        className="h-11 px-4 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 transition-all"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email{" "}
                        <span className="text-gray-300 font-normal normal-case">(optional)</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 px-4 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 transition-all"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <p className="text-xs text-red-500 mb-4 mt-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
                >
                    {loading
                        ? mode === "join" ? "Joining..." : "Creating..."
                        : mode === "join" ? "Join Room" : "Save & continue"
                    }
                    {!loading && <ArrowRight size={14} />}
                </button>
            </div>

            {/* Back link */}
            <button
                onClick={onBack}
                disabled={loading}
                className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
            >
                ← Back
            </button>
        </div>
    );
}