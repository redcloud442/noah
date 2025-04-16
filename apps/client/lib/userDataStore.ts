import { teamMemberProfile } from "@/utils/types";
import { user_table } from "@prisma/client";
import { create } from "zustand";

interface UserStore {
  userData: {
    userProfile: user_table;
    teamMemberProfile: teamMemberProfile;
  } | null;
  setUserData: (userData: UserStore["userData"]) => void;
}

const useUserDataStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (userData) => set({ userData }),
}));

export default useUserDataStore;
