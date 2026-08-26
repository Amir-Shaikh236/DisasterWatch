import { getReports } from "@/api/reportApi";
import { create } from "zustand";

export const useReports = create((set) => ({
    reports: [],
    isLoading: false,
    error: null,

    fetchReports: async () => {
        set({ isLoading: true })

        try {
            const reports = await getReports()
            set({ reports: Array.isArray(reports) ? reports : [], isLoading: false, error: null })

        } catch (error) {
            set({ reports: [], isLoading: false, error: error });

        }
    },

    addReport: (report) => {
        if (report) set((state) => ({ reports: [report, ...state.reports] }))
    },

    clearReports: () => {
        set({ reports: [], isLoading: false, error: null })
    }
}));