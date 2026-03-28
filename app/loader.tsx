"use client"

import { useApi } from "@/context/api-context"

export function Loader() {
  const { loading } = useApi();
  console.log("loading",loading);

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="relative">
          <div className="flex justify-center items-center h-full w-full">
            <svg
              width="64"
              height="64"
              viewBox="0 0 27 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin"
              style={{ animation: "spin 1s linear infinite" }} 
            >
              <path
                d="M13.5 1V5.8M25.5 13H20.7M23.8923 19L19.7354 16.6M19.5 23.3923L17.1 19.2354M13.5 25V20.2M7.5 23.3923L9.9 19.2354M3.10769 19L7.26462 16.6M1.5 13H6.3M3.10769 7L7.26462 9.4M7.5 2.60769L9.9 6.76462"
                stroke="#1454CC"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <style>{`
              @keyframes spin {
                100% {
                  transform: rotate(360deg);
                }
              }
              .animate-spin {
                animation: spin 1s linear infinite;
              }
            `}</style>
          </div>
        <div className="mt-4 -ml-2 text-center text-sm font-medium text-neutral-800">Loading...</div>
      </div>
    </div>
  )
}