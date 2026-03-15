'use client'

import { useState } from "react";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

type RequestMessage = "GET" | "POST"

export default function ApiFetch<T = unknown>() {

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const token = Cookies.get('bearerToken');

    const handleAuthError = () => {
        Cookies.remove("bearerToken"); // clear expired token
        router.push("/Auth");
    };

    const request = async (
        url: string,
        method: RequestMessage = "GET",
        body?: unknown
    ) => {

        setLoading(true);
        setError(null);

        try {

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: method === "POST" ? JSON.stringify(body) : undefined,
            });

            if (res.status === 401) {
                handleAuthError();
                return;
            }

            if (!res.ok) throw new Error("Request failed");

            const result = await res.json();
            setData(result);
            return result;

        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const requestForm = async (url: string, body: FormData) => {

        setLoading(true);
        setError(null);

        try {

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body,
            });

            if (res.status === 401) {
                handleAuthError();
                return;
            }

            if (!res.ok) throw new Error("Request failed");

            const result = await res.json();
            setData(result);
            return result;

        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        get: (url: string) => request(url, "GET"),
        post: (url: string, body: unknown) => request(url, "POST", body),
        postForm: (url: string, body: FormData) => requestForm(url, body),
    };
}