import { useState } from "react";

type RequestMessage = "GET" | "POST"


export default function apiFetch<T = unknown>() {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
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
                    Authorization: "",
                },
                body: method === "POST" ? JSON.stringify(body) : undefined,
            });

            if (!res.ok) {
                throw new Error("Request failed");
            }

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
    };
}
