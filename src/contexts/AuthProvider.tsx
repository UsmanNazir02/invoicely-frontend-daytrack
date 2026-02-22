import { useEffect, useState, type ReactNode } from 'react';
import axios from 'axios';
import type { User } from '../types';
import { authService } from '../services';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const stored = localStorage.getItem('authUser');
            return stored ? (JSON.parse(stored) as User) : null;
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
            localStorage.setItem('authUser', JSON.stringify(userData));
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('authUser');
            }
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userData = await authService.getProfile();
                setUser(userData);
                localStorage.setItem('authUser', JSON.stringify(userData));
            } catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('authUser');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setUser(response.user);
        localStorage.setItem('authUser', JSON.stringify(response.user));
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        localStorage.removeItem('authUser');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
