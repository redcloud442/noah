import { productService } from "@/services/product";
import { product_category_table, product_table } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCollectionQueryKey, getProductQueryKey } from "./queryKeys";

export const useCollectionQuery = (
  take: number,
  skip: number,
  search: string = "",
  teamId?: string
) => {
  const queryKey = getCollectionQueryKey(take, skip, search, teamId ?? "");

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!teamId) return null;

      const query = queryClient.getQueryData<{
        collections: product_category_table[];
        count: number;
      }>(queryKey);

      if (query) {
        return query;
      }

      const data = await productService.getCollections({
        take,
        skip,
        search,
        teamId,
      });

      queryClient.setQueryData(queryKey, data);

      return data;
    },
    enabled: !!teamId || !!take || !!skip || !!search,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  return query;
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

export const useProductQuery = (
  take: number,
  skip: number,
  search: string = "",
  teamId?: string,
  category?: string
) => {
  const queryKey = getProductQueryKey(take, skip, search, teamId, category);

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!teamId) return null;

      const query = queryClient.getQueryData<{
        data: product_table[];
        count: number;
      }>(queryKey);

      if (query) {
        return query;
      }

      const data = await productService.getProducts({
        take,
        skip,
        search,
        teamId,
        category,
      });

      queryClient.setQueryData(queryKey, data);

      return data;
    },
    enabled: !!teamId || !!take || !!skip || !!search,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  return query;
};
