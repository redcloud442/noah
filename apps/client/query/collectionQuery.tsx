import { productService } from "@/services/product";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCollectionQuery = (
  take: number,
  skip: number,
  initialData?: {
    product_category_id: string;
    product_category_name: string;
    product_category_description: string;
  }[],
  search?: string
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["collections", take, skip, search],
    queryFn: async () => {
      const existingData = queryClient.getQueryData([
        "collections",
        take,
        skip,
        search,
      ]);

      if (existingData) {
        return existingData;
      }

      const data = await productService.getCollections({ take, skip, search });
      return data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!take && !!skip,
    initialData: () => {
      if (!search && initialData) {
        return {
          collections: initialData,
          count: initialData.length,
        };
      }

      const cachedData = queryClient.getQueryData([
        "collections",
        take,
        skip,
        search,
      ]);

      if (cachedData) {
        return cachedData;
      }

      return undefined;
    },
  });
};

export const useCreateCollectionMutation = (
  take: number,
  skip: number,
  search?: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (value: { search: string }) => {
      await productService.getCollections({
        take,
        skip,
        search: value.search,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["collections", take, skip, search],
      });

      return {
        success: true,
        message: "Collection created successfully",
      };
    },
    onError: (error) => {
      return {
        success: false,
        message: error.message,
      };
    },
  });
};
