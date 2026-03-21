'use client'
import { createContext, useContext, useState } from "react";

const ApiContext = createContext<any>(null);

export function ApiProvider({ children }: any) {
    const [loading, setLoading] = useState(false);

    return (
        <ApiContext.Provider value={{ loading, setLoading }}>
            {children}
        </ApiContext.Provider>
    );
}

export const useApi = () => useContext(ApiContext);