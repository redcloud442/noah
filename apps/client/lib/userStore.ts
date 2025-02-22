import { create } from "zustand";

interface UserStore {
  user: {
    id: string;
    email: string;
    role: string;
  };
  setUser: (user: UserStore["user"]) => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: {
    id: "",
    email: "",
    role: "",
  },
  setUser: (user) => set({ user }),
}));

export default useUserStore;
