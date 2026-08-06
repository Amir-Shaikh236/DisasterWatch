/* eslint-disable */

import { createContext, useState, useRef, useCallback, useEffect } from "react";
import { setInterceptors, privateClient } from "../api/api";
import PropTypes from "prop-types";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    const tokenRef = useRef(null);
    const interceptorInitialized = useRef(false);

    const updateToken = useCallback((token) => {
        tokenRef.current = token;
        setAccessToken(token);
        setIsAuthenticated(!!token);
        if (token) localStorage.setItem('DisasterWatch_hint', 'true');

    }, []);

    const clearSession = useCallback(() => {
        tokenRef.current = null;
        setAccessToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('DisasterWatch_hint');
    }, []);

    useEffect(() => {
        if (!interceptorInitialized.current) {
            setInterceptors(() => tokenRef.current, updateToken, clearSession);
            interceptorInitialized.current = true;
        }

    }, [updateToken, clearSession])

    useEffect(() => {
        const initializeSession = async () => {
            const hasSessionHint = localStorage.getItem('DisasterWatch_hint') === 'true';
            if (!hasSessionHint) {
                setIsInitializing(false)
                return;
            }

            try {
                const response = await privateClient.post('/api/auth/refresh');
                updateToken(response.data?.accessToken);

            } catch (error) {
                console.warn("[AUTH ENGINE]: Automated session recovery bypassed or token expired.");
                clearSession()

            } finally {
                setIsInitializing(false)
            }
        };

        initializeSession();
    }, []);

    return (
        <AuthContext.Provider value={{ accessToken, isAuthenticated, isInitializing, updateToken, clearSession }}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.prototype = { children: PropTypes.node.isRequired };