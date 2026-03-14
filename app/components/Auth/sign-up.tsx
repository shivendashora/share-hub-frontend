'use client'
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import apiFetch from "@/utils/api-fetch"

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

export default function SignUp({ onBackToLogin }: any) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { post } = apiFetch()

    const passwordsMatch = !confirmPassword || password === confirmPassword;

    const handleSignUp = async (e: any) => {
        e.preventDefault();
        console.log("UserName", username);
        console.log("PassWord", password);
        console.log("ConfirmPassword", confirmPassword);
        console.log('email', email);

        const signUpPayload = {
            username: username,
            password: password,
            confirmPassword: confirmPassword,
            email: email
        }

        const response = await post("http://localhost:3001/auth/signup", signUpPayload)
        console.log("Response from API..", response);

    }

    return (
        <div className="w-full max-w-sm flex flex-col gap-7 px-6">
            {/* Heading */}
            <div>
                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 font-medium mb-4 transition-colors"
                >
                    <ArrowLeft size={13} /> Back to login
                </button>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create account</h2>
                <p className="mt-1.5 text-sm text-gray-500">Join Share Hub — it's free to get started</p>
            </div>

            {/* Form */}
            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    handleSignUp(e)
                }}
            >
                <InputField
                    label="Username"
                    id="username"
                    placeholder="cooluser123"
                    value={username}
                    onChange={(e: any) => setUsername(e.target.value)}
                />

                <InputField
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                />

                <InputField
                    label="Password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    rightElement={
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 transition-colors">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    }
                />

                <div className="flex flex-col gap-1.5 w-full">
                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            className={`w-full h-11 px-4 pr-11 bg-gray-50 border text-gray-900 text-sm rounded-xl outline-none transition-all focus:bg-white focus:ring-2 placeholder:text-gray-400 ${!passwordsMatch
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-gray-400 hover:text-gray-600 transition-colors">
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    {!passwordsMatch && (
                        <p className="text-xs text-red-500 font-medium">Passwords don't match</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!passwordsMatch}
                    className="mt-1 flex items-center justify-center gap-2 h-11 w-full bg-blue-600 hover:bg-blue-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-blue-200"
                >
                    Create account <ArrowRight size={15} />
                </button>
            </form>

            <p className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <button type="button" onClick={onBackToLogin}
                    className="text-blue-600 font-semibold hover:underline">
                    Sign in
                </button>
            </p>
        </div>
    );
}