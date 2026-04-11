'use client'

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function BodyLayout({ children }: any) {

    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const token = Cookies.get("bearerToken");
        const isAuth = pathname === "/Auth" || pathname === "/";

        if (token && isAuth) {
            router.push('/rooms-details');
            return;
        }

        if (isAuth) {
            setChecked(true);
            return;
        }

        if (token) {
            setChecked(true);
        } else {
            router.replace("/Auth");
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
