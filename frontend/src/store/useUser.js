import { getAuthUser } from "@/api/authAPI";
import { create } from "zustand";

export const useUser = create((set) => ({
    user: null,
    loading: false,

    setUser: (user) => set({ user, loading: false }),

    clearUser: () => set({ user: null, loading: false }),

    fetchUser: async () => {
        set({ loading: true });

        try {
            const data = await getAuthUser();
            set({ user: data.user, loading: false });

        } catch (error) {
            console.error('Failed to fetch User ("Zustand"): ', error);
            set({ user: null, loading: false });

        }
    },
}));

