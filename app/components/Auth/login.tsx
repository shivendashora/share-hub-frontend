'use client'
import { useState } from "react";
import SignUp from "./sign-up";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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

export default function Login() {
    const [signUp, setSignUp] = useState(false);
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    if (signUp) return <SignUp onBackToLogin={() => setSignUp(false)} />;

    return (
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
                    console.log("Login →", { usernameOrEmail, password });
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
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors">
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
    );
}