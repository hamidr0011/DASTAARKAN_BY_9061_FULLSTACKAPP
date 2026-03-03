import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://assignmentno2madby9061-production.up.railway.app/api';
// Backend is deployed on Railway at the above URL


const getHeaders = async () => {
    const session = await AsyncStorage.getItem('@dastarkhan_user_session');
    const parsed = session ? JSON.parse(session) : null;
    return {
        'Content-Type': 'application/json',
        ...(parsed?.token ? { Authorization: `Bearer ${parsed.token}` } : {})
    };
};

// ─── AUTH ──────────────────────────────────────────
export const registerUser = async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return res.json();
};

export const loginUser = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
};

// ─── MENU ──────────────────────────────────────────
export const getMenuItems = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu?${params}`, { headers });
    return res.json();
};

export const getSpecials = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/specials`, { headers });
    return res.json();
};

export const addMenuItem = async (item) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu`, {
        method: 'POST', headers, body: JSON.stringify(item)
    });
    return res.json();
};

export const updateMenuItem = async (id, item) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
        method: 'PUT', headers, body: JSON.stringify(item)
    });
    return res.json();
};

export const toggleMenuItemAvailability = async (id, available) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/${id}/availability`, {
        method: 'PATCH', headers, body: JSON.stringify({ available })
    });
    return res.json();
};

export const deleteMenuItem = async (id) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
        method: 'DELETE', headers
    });
    return res.json();
};

// ─── ORDERS ────────────────────────────────────────
export const placeOrder = async (orderData) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST', headers, body: JSON.stringify(orderData)
    });
    return res.json();
};

export const getMyOrders = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/my-orders`, { headers });
    return res.json();
};

export const getAllOrders = async (status) => {
    const headers = await getHeaders();
    const params = status && status !== 'All' ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/orders${params}`, { headers });
    return res.json();
};

export const updateOrderStatus = async (id, status) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status })
    });
    return res.json();
};

export const cancelOrder = async (id) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
        method: 'PATCH', headers
    });
    return res.json();
};

// ─── RESERVATIONS ──────────────────────────────────
export const createReservation = async (data) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations`, {
        method: 'POST', headers, body: JSON.stringify(data)
    });
    return res.json();
};

export const getMyReservations = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/my-reservations`, { headers });
    return res.json();
};

export const getAllReservations = async (status) => {
    const headers = await getHeaders();
    const params = status && status !== 'All' ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/reservations${params}`, { headers });
    return res.json();
};

export const cancelReservation = async (id) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, {
        method: 'PATCH', headers
    });
    return res.json();
};

export const updateReservationStatus = async (id, status) => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/${id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status })
    });
    return res.json();
};

export const getDashboardStats = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/stats/dashboard`, { headers });
    return res.json();
};
