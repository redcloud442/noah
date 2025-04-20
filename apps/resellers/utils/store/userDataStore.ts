import { teamMemberProfile } from "@/utils/types";
import { reseller_table, user_table } from "@prisma/client";
import { create } from "zustand";

interface UserStore {
  userData: {
    userProfile: user_table;
    teamMemberProfile: teamMemberProfile;
    resellerProfile: reseller_table;
  } | null;
  setUserData: (userData: UserStore["userData"]) => void;
  clearUserData: () => void;
  deductBalance: (userData: UserStore["userData"], amount: number) => void;
}

const useUserDataStore = create<UserStore>((set) => ({
  userData: null,
  setUserData: (userData) => set({ userData }),
  clearUserData: () => set({ userData: null }),
  deductBalance: (userData, amount: number) => {
    if (!userData) return;
    set({
      userData: {
        ...userData,
        resellerProfile: {
          ...userData.resellerProfile,
          reseller_withdrawable_earnings:
            userData.resellerProfile.reseller_withdrawable_earnings - amount,
        },
      },
    });
  },
}));

export default useUserDataStore;
