import { getAlerts } from "@/api/alertApi";
import { create } from "zustand";

export const useAlerts = create((set) => ({
    alerts: [],
    isLoading: false,
    error: null,

    fetchAlerts: async () => {
        set({ isLoading: true })

        try {
            const data = await getAlerts();
            set({ alerts: Array.isArray(data) ? data : [], isLoading: false, error: null })

        } catch (error) {
            set({ alerts: [], isLoading: false, error: error })

        }
    },

    addAlert: (alert) => {
        if (alert) set((state) => ({ alerts: [...state.alerts, alert] }));
    },

    clearAlerts: () => {
        set({ alerts: [], error: null });
    },
}));