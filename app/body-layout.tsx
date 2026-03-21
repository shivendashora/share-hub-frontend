'use client'

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function BodyLayout({ children }: any) {

    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    const isAuthPage = pathname === "/Auth";

    useEffect(() => {
        if (isAuthPage) {
            setChecked(true);
            return;
        }

        const token = Cookies.get("bearerToken");

        if (!token) {
            router.replace("/Auth");
        } else {
            setChecked(true);
        }
    }, [pathname]);

    if (!checked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <p className="text-sm font-medium text-gray-500 tracking-wide animate-pulse">
                    Checking authentication...
                </p>
            </div>
        );
    }

    return (
        <div className="px-4 py-4 bg-slate-100 min-h-screen">
                {children}
        </div>
    );
}
