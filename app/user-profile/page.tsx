'use client'

import { useEffect, useEffectEvent, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  Upload,
  UserRound,
  User
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useApi } from "@/context/api-context";

const PROFILE_ENDPOINT = "http://localhost:3001/auth/complete-profile";
const USER_DETAILS_ENDPOINT = "http://localhost:3001/auth/userDetails";

interface DecodedToken {
  exp?: number;
  userId?: number;
  userName?: string;
}

function readTokenDetails() {
  const token = Cookies.get("bearerToken");

  if (!token) return { decodedToken: null, token: null };

  try {
    return {
      decodedToken: jwtDecode<DecodedToken>(token),
      token,
    };
  } catch (error) {
    console.error(error);
    return { decodedToken: null, token };
  }
}

async function parseJsonSafely(response: Response) {
  const responseText = await response.text();

  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function prettifyLabel(key: string) {
  return key
    .replaceAll(/([A-Z])/g, " $1")
    .replaceAll(/[_-]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  error,
  showRequiredError,
  placeholder,
}: Readonly<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showRequiredError?: boolean;
  placeholder?: string;
}>) {
  const [visible, setVisible] = useState(false);

  const hasError = showRequiredError || !!error;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
      >
        {label}
        <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`h-12 w-full rounded-xl border px-4 pr-11 text-sm text-gray-900 outline-none transition-colors focus:bg-white ${
            hasError
              ? "border-red-300 bg-red-50 focus:border-red-400"
              : "border-gray-200 bg-gray-50 focus:border-indigo-400"
          }`}
        />

        {value.trim() !== "" && (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {showRequiredError && (
        <p className="mt-1 text-xs text-red-500">{label} is required</p>
      )}

      {!showRequiredError && error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [notice, setNotice] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [attemptedSave, setAttemptedSave] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setLoading } = useApi();

  const roomId = searchParams.get("roomId");

  const backHref = roomId
    ? `/Rooms?roomId=${roomId}`
    : "/rooms-details";

  const passwordMismatch =
    confirmPassword.trim() !== "" &&
    password.trim() !== "" &&
    password !== confirmPassword;

  const fetchUserDetails = async () => {
    const { token, decodedToken } = readTokenDetails();

    if (!token) {
      router.replace("/Auth");
      return;
    }

    setIsLoadingProfile(true);
    setLoading(true);

    try {
      const response = await fetch(
        `${USER_DETAILS_ENDPOINT}?ids=${decodedToken?.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        Cookies.remove("bearerToken");
        router.replace("/Auth");
        return;
      }

      const payload = await parseJsonSafely(response);
      const mappedUser = payload?.mappedUsers?.[0];

      if (mappedUser) {
        setUserName(mappedUser.userName ?? "");
        setEmail(mappedUser.email ?? "");
      }
    } catch (error) {
      console.error(error);
      setNotice("Could not load profile.");
      setIsSuccess(false);
    } finally {
      setIsLoadingProfile(false);
      setLoading(false);
    }
  };

  const runInitialFetch = useEffectEvent(() => {
    void fetchUserDetails();
  });

  useEffect(() => {
    runInitialFetch();
  }, []);

  useEffect(() => {
    return () => {
      if (profilePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleProfileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setAttemptedSave(true);
    setNotice(null);

    if (
      userName.trim() === "" ||
      email.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      setNotice("Please fill all required fields.");
      setIsSuccess(false);
      return;
    }

    if (password !== confirmPassword) {
      setNotice("Passwords do not match.");
      setIsSuccess(false);
      return;
    }

    const { token, decodedToken } = readTokenDetails();

    if (!token) {
      router.replace("/Auth");
      return;
    }

    setIsSaving(true);
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("username", userName.trim());
      formData.append("email", email.trim());
      formData.append("password", password.trim());
      formData.append("confirmPassWord", confirmPassword.trim());

      if (decodedToken?.userId) {
        formData.append("userId", String(decodedToken.userId));
      }

      if (profileFile) {
        formData.append("profile", profileFile);
      }

      const response = await fetch(PROFILE_ENDPOINT, {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      const savedResponse = await parseJsonSafely(response);

      if (savedResponse?.token) {
        Cookies.set("bearerToken", savedResponse.token);
      }

      setNotice("User details updated successfully.");
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setNotice("Could not save profile.");
      setIsSuccess(false);
    } finally {
      setIsSaving(false);
      setLoading(false);
    }
  };

  const fields = [
    {
      id: "userName",
      label: prettifyLabel("userName"),
      value: userName,
      onChange: (value: string) => setUserName(value),
      type: "text",
    },
    {
      id: "email",
      label: prettifyLabel("email"),
      value: email,
      onChange: (value: string) => setEmail(value),
      type: "email",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Top Header */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Logged In Username */}
        <div className="ml-auto flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2">
          <User size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-700">
            {userName || "Loading user..."}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {notice && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm ${
              isSuccess
                ? "border border-green-100 bg-green-50 text-green-700"
                : "border border-red-100 bg-red-50 text-red-600"
            }`}
          >
            {notice}
          </div>
        )}

        {isLoadingProfile ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Profile Picture
              </label>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                  {profilePreview ? (
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${profilePreview})` }}
                    />
                  ) : (
                    <UserRound size={22} className="text-gray-400" />
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileChange}
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700"
                >
                  <Upload size={16} />
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Inputs */}
            {fields.map((field) => (
              <div key={field.id}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {field.label}
                </label>

                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm"
                />
              </div>
            ))}

            {/* Password */}
            <div className="grid gap-4 md:grid-cols-2">
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Add your updated password"
                showRequiredError={attemptedSave && password.trim() === ""}
              />

              <PasswordInput
                id="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirm your updated password"
                showRequiredError={
                  attemptedSave && confirmPassword.trim() === ""
                }
                error={passwordMismatch ? "Passwords do not match" : undefined}
              />
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}