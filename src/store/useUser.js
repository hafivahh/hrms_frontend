import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: {
        id: 0,
        id_user: 0,
        id_role: null,
        name: null,
        token: null,
        permissions: [],
      },

      setUser: (value) => set({ user: value }),
      
      logout: () =>
        set({
          user: {
            id: 0,
            id_user: 0,
            id_role: null,
            name: null,
            token: null,
            permissions: [],
          },
        }),
    }),
    {
      name: "user",
      storage: createJSONStorage(() => localStorage), // ← explicit localStorage
    }
  )
);

export default useUser;