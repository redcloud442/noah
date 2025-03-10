import { create } from "zustand";

interface UserStore {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar: string;
  };
  setUser: (user: UserStore["user"]) => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: {
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    avatar: "",
    role: "",
  },
  setUser: (user) => set({ user }),
}));

export default useUserStore;
