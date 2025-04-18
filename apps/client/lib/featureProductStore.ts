import { FeaturedProductType } from "@/utils/types";
import { create } from "zustand";

interface FeatureProductStore {
  featuredProducts: FeaturedProductType[];
  setFeaturedProducts: (featuredProducts: FeaturedProductType[]) => void;
}

const useFeatureProductStore = create<FeatureProductStore>((set) => ({
  featuredProducts: [],
  setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
}));

export default useFeatureProductStore;
