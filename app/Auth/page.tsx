import { CloudDownload, Share2, Shield, Zap } from "lucide-react";
import Login from "../components/Auth/login";

const features = [
    { icon: Share2, label: "Instant file sharing" },
    { icon: Shield, label: "End-to-end encrypted" },
    { icon: Zap, label: "Lightning fast uploads" },
];

export default function Auth() {
    return (
        <div className="flex flex-row items-stretch h-[calc(100vh-34px)] rounded-2xl overflow-hidden shadow-2xl">

            {/* Left branding panel */}
            <div className="relative w-[40%] flex flex-col items-center justify-center gap-8 overflow-hidden"
                style={{ background: "linear-gradient(145deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)" }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #93c5fd, transparent)" }} />
                <div className="absolute -bottom-20 -right-12 w-80 h-80 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #bfdbfe, transparent)" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-5 border border-white" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full opacity-5 border border-white" />

                {/* Content */}
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