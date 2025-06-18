import { create } from "zustand";

interface CollectionProductStore {
  collections: {
    product_category_id: string;
    product_category_name: string;
    product_category_image: string | null;
    product_category_slug: string;
    product_category_description: string;
  }[];
  setCollections: (
    collections: {
      product_category_id: string;
      product_category_name: string;
      product_category_image: string | null;
      product_category_slug: string;
      product_category_description: string;
    }[]
  ) => void;
}

const useCollectionProductStore = create<CollectionProductStore>((set) => ({
  collections: [],
  setCollections: (collections) => set({ collections }),
}));

export default useCollectionProductStore;
