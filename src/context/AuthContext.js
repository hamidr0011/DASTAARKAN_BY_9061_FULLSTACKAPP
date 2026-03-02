import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const userSession = await AsyncStorage.getItem('@dastarkhan_user_session');
            if (userSession) {
                setUser(JSON.parse(userSession));
            }
        } catch (e) {
            console.log('Error checking login status', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await loginUser(email, password);
            if (response.success) {
                const session = { ...response.user, token: response.token };
                await AsyncStorage.setItem('@dastarkhan_user_session', JSON.stringify(session));
                setUser(session);
                setIsLoading(false);
                return { success: true, user: session };
            } else {
                setIsLoading(false);
                return { success: false, error: response.error };
            }
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: 'Cannot connect to server. Check your connection.' };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('@dastarkhan_user_session');
            setUser(null);
        } catch (e) {
            console.log('Error logging out', e);
        }
    };

    const register = async (name, email, password, phone, role = 'customer', managerCode = '') => {
        setIsLoading(true);
        try {
            const payload = { name, email, password, phone, role };
            if (role === 'manager') {
                payload.managerCode = managerCode;
            }
            const response = await registerUser(payload);
            if (response.success) {
                setIsLoading(false);
                return { success: true };
            } else {
                setIsLoading(false);
                return { success: false, error: response.error || response.errors?.[0]?.msg || 'Registration failed' };
            }
        } catch (error) {
            setIsLoading(false);
            return { success: false, error: 'Cannot connect to server. Check your connection.' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
