'use client'

import { CloudDownload, Share2, Shield, Zap, ArrowRight, X, User } from "lucide-react";
import Login from "../components/Auth/login";
import { useState, useEffect } from "react";
import GuestProfileSetup from "../components/Auth/guest-profile-setup";

const features = [
    { icon: Share2, label: "Instant file sharing" },
    { icon: Shield, label: "End-to-end encrypted" },
    { icon: Zap, label: "Lightning fast uploads" },
];

function WelcomeDialog({ onExit }: Readonly<{ onExit: () => void }>) {
    const [step, setStep] = useState<"welcome" | "profile">("welcome");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <button className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onExit} />

            <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1 w-full" />

                {step === "welcome" ? (
                    <div className="p-7">
                        <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                            style={{ background: "linear-gradient(145deg, #1e3a8a, #2563eb)" }}
                        >
                            <CloudDownload size={26} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            Ready to continue?
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                            You're about to enter your shared workspace as a guest. Set up your profile on the next step.
                        </p>

                        <div className="flex flex-col gap-3 mt-7">
                            <button
                                onClick={() => setStep("profile")}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-md"
                                style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
                            >
                                Continue as guest
                                <ArrowRight size={15} />
                            </button>
                            <button
                                onClick={onExit}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 transition-all duration-200 active:scale-[0.98]"
                            >
                                <X size={14} />
                                Go Back
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
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                Set up your profile
                            </h2>
                            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                                Add your details so teammates can recognize you.
                            </p>
                        </div>
                        <GuestProfileSetup
                            mode="guest"
                            onBack={() => setStep("welcome")}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default function Auth() {
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsDialogOpen(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-row items-stretch h-[calc(100vh-34px)] rounded-2xl overflow-hidden shadow-2xl">
            {isDialogOpen && <WelcomeDialog onExit={() => setIsDialogOpen(false)} />}

            {/* Left branding panel */}
            <div
                className="relative w-[40%] flex flex-col items-center justify-center gap-8 overflow-hidden"
                style={{ background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)" }}
            >
                <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #93c5fd, transparent)" }} />
                <div className="absolute -bottom-20 -right-12 w-80 h-80 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #bfdbfe, transparent)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 border border-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-5 border border-white" />

                <div className="relative z-10 flex flex-col items-center gap-6 px-10">
                    <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-lg">
                        <CloudDownload size={38} className="text-white" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white tracking-tight">SHARE HUB</h1>
                        <p className="mt-2 text-blue-200 text-sm leading-relaxed max-w-[220px] mx-auto">
                            Your secure space to store, share, and collaborate.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full mt-2">
                        {features.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 backdrop-blur-sm">
                                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                                    <Icon size={14} className="text-white" />
                                </div>
                                <span className="text-sm text-blue-100 font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="w-[60%] bg-white flex items-center justify-center">
                <Login />
            </div>
        </div>
    );
}