
import React, { createContext, useState, useCallback } from 'react';
import { getMyReservations, getAllReservations, cancelReservation as cancelReservationApi, updateReservationStatus } from '../services/api';

export const ReservationsContext = createContext();

export const ReservationsProvider = ({ children }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReservations = useCallback(async (isManager = false) => {
        setLoading(true);
        try {
            const response = isManager ? await getAllReservations() : await getMyReservations();
            if (response.success) {
                setReservations(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch reservations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addReservation = (reservation) => {
        setReservations(prev => [reservation, ...prev]);
    };

    const cancelReservation = async (id) => {
        try {
            const response = await cancelReservationApi(id);
            if (response.success) {
                setReservations(prev => prev.map(res =>
                    res.id === id ? { ...res, status: 'Cancelled' } : res
                ));
            }
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
        }
    };

    const confirmReservation = async (id) => {
        try {
            const response = await updateReservationStatus(id, 'Confirmed');
            if (response.success) {
                setReservations(prev => prev.map(res =>
                    res.id === id ? { ...res, status: 'Confirmed' } : res
                ));
            }
        } catch (error) {
            console.error('Failed to confirm reservation:', error);
        }
    };

    return (
        <ReservationsContext.Provider value={{ reservations, loading, fetchReservations, addReservation, cancelReservation, confirmReservation }}>
            {children}
        </ReservationsContext.Provider>
    );
};
