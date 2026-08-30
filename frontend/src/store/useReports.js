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
        set((state) => {
            const exists = state.reports.some((existreport) => existreport._id === report._id);
            if (exists) return state;

            return { reports: [report, ...state.reports] };
        });
    },

    removeReport: (reportId) => {
        set((state) => ({
            reports: state.reports.filter((report) => report._id !== reportId)
        }));
    },

    clearReports: () => {
        set({ reports: [], isLoading: false, error: null })
    }

}));