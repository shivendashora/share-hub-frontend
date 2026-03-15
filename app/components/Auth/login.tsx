'use client'
import { useState } from "react";
import SignUp from "./sign-up";
import { Eye, EyeOff, ArrowRight, X, Hash, User } from "lucide-react";
import ApiFetch from "@/utils/api-fetch";
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation";
import GuestProfileSetup from "./guest-profile-setup";

function InputField({ label, id, type = "text", placeholder, value, onChange, rightElement }: any) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-11 px-4 pr-11 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400"
                />
                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
                )}
            </div>
        </div>
    );
}

// --- Join Room Dialog ---
function JoinRoomDialog({ onClose }: Readonly<{ onClose: () => void }>) {
    const [step, setStep] = useState<"roomId" | "profile">("roomId");
    const [roomId, setRoomId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleJoin = async () => {
        if (!roomId.trim()) {
            setError("Please enter a room ID");
            return;
        }

        Cookies.remove("bearerToken");
        const token = Cookies.get("bearerToken");

        // No token — go straight to profile setup
        if (!token) {
            setStep("profile");
            return;
        }

        console.log("found token");
        // Check expiry
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const isExpired = payload.exp && payload.exp * 1000 < Date.now();
            if (isExpired) {
                Cookies.remove("bearerToken");
                setStep("profile");
                return;
            }

            // Valid existing user — join directly
            setLoading(true);
            setError(null);

            const res = await fetch("http://localhost:3001/rooms/joinUserToRoom", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    roomId: String(roomId),
                    userId: payload.userId,
                }),
            });

            if (!res.ok) throw new Error("Failed to join");

            router.push(`/Rooms?roomId=${roomId}`);

        } catch (e: any) {
            console.error(e);
            setError("Couldn't join room. Check the ID and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1 w-full bg-blue-600" />

                {step === "roomId" ? (
                    <div className="p-7">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                            style={{ background: "linear-gradient(145deg, #1e3a8a, #2563eb)" }}
                        >
                            <Hash size={22} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Join a Room</h2>
                        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                            Enter the Room ID shared with you to join the workspace.
                        </p>

                        <div className="mt-6">
                            <InputField
                                label="Room ID"
                                id="roomId"
                                placeholder="e.g. 1042"
                                value={roomId}
                                onChange={(e: any) => { setRoomId(e.target.value); setError(null); }}
                            />
                            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleJoin}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60"
                                style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
                            >
                                {loading ? "Joining..." : "Next"}
                                {!loading && <ArrowRight size={14} />}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="h-11 px-4 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-60"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-7 pt-6 pb-0">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: "linear-gradient(145deg, #1e3a8a, #2563eb)" }}
                            >
                                <User size={18} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Set up your profile</h2>
                            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                                Quick setup before joining room <span className="font-semibold text-gray-700">#{roomId}</span>
                            </p>
                        </div>
                        {/* mode="join" passes roomId, button shows "Join Room", calls joinUserToRoom after signup */}
                        <GuestProfileSetup
                            mode="join"
                            roomId={roomId}
                            onBack={() => setStep("roomId")}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

// --- Login ---
export default function Login() {
    const [signUp, setSignUp] = useState(false);
    const [joinRoomOpen, setJoinRoomOpen] = useState(false);
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { post } = ApiFetch();

    const handleLogin = async () => {
        const loginPayload = {
            username: usernameOrEmail,
            password: password,
        };
        try {
            const response = await post("http://localhost:3001/auth/login", loginPayload);
            Cookies.set("bearerToken", response.token);
            router.push("/Rooms");
        } catch (e: any) {
            console.error(e);
        }
    };

    if (signUp) return <SignUp onBackToLogin={() => setSignUp(false)} />;

    return (
        <>
            {/* Join Room Dialog */}
            {joinRoomOpen && (
                <JoinRoomDialog onClose={() => setJoinRoomOpen(false)} />
            )}

            <div className="w-full max-w-sm flex flex-col gap-8 px-6">
                {/* Heading */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                    <p className="mt-1.5 text-sm text-gray-500">Sign in to your Share Hub account</p>
                </div>

                {/* Form */}
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                >
                    <InputField
                        label="Username or Email"
                        id="usernameOrEmail"
                        placeholder="you@example.com"
                        value={usernameOrEmail}
                        onChange={(e: any) => setUsernameOrEmail(e.target.value)}
                    />

                    <InputField
                        label="Password"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        }
                    />

                    <div className="flex justify-end">
                        <button type="button" className="text-xs text-blue-600 hover:underline font-medium">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="mt-1 flex items-center justify-center gap-2 h-11 w-full bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-200"
                    >
                        Sign in <ArrowRight size={15} />
                    </button>

                    <button
                        type="button"
                        onClick={() => setJoinRoomOpen(true)}
                        className="flex items-center justify-center gap-2 h-11 w-full border-2 border-blue-200 hover:border-blue-500 hover:text-blue-600 text-blue-500 text-sm font-semibold rounded-xl transition-all"
                    >
                        <Hash size={15} />
                        Join a Room
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">New to Share Hub?</span>
                    <div className="flex-1 h-px bg-gray-100" />
                </div>

                <button
                    type="button"
                    onClick={() => setSignUp(true)}
                    className="h-11 w-full border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 text-sm font-semibold rounded-xl transition-all"
                >
                    Create an account
                </button>
            </div>
        </>
    );
}