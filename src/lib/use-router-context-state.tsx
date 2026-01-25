import { useEffect, useState } from "react";
import type { RouterContext, userState, userRole } from "../routes/__root";

export function useRouterContextState(): RouterContext {
    const [state, setState] = useState<userState | null>(() => {
        const token = localStorage.getItem("token");
        const expiry = localStorage.getItem("expiry");
        const role = localStorage.getItem("userRole") as userRole | null;

        if (!token || !expiry || !role) return null;

        const expiryDate = new Date(expiry);
        if (isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
            localStorage.removeItem("token");
            localStorage.removeItem("expiry");
            localStorage.removeItem("userRole");
            return null;
        }

        return {
            token,
            expiry: expiryDate,
            role
        };
    });

    useEffect(() => {
        if (!state || !state.expiry) return;

        try {
            const expiryDate = new Date(state.expiry);

            // Check if date is valid
            if (isNaN(expiryDate.getTime())) {
                console.error("Invalid expiry date");
                logout();
                return;
            }

            if (expiryDate > new Date()) {
                console.log("Persisting user state to localStorage");
                localStorage.setItem("token", state.token);
                localStorage.setItem("expiry", expiryDate.toISOString());
                localStorage.setItem("userRole", state.role);
            } else {
                logout();
            }
        } catch (error) {
            console.error("Error processing expiry date:", error);
            logout();
        }
    }, [state]);

    const login = (token: string, expiry: Date, role: userRole) => {
        console.log("Logging in user", { token, expiry, role });
        setState({ token, expiry, role });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("expiry");
        localStorage.removeItem("userRole");
        setState(null);
    };

    const role = state?.role ?? "";

    const isManager = role === "manager";
    const isClient = role === "client";
    const isAuthenticated = !!state;

    return {
        role,
        userState: state as userState,
        login,
        logout,
        isManager,
        isClient,
        isAuthenticated
    };
}
