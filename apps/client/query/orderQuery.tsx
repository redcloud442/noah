import { ordersService } from "@/services/orders";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrderQuery = (take: number, skip: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["orders", take, skip],
    queryFn: () => ordersService.getOrders({ take, skip }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!take && !!skip,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: () => queryClient.getQueryData(["orders", take, skip]),
  });
};

export const useOrderQueryAdmin = (
  take: number,
  skip: number,
  userId: string
) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["orders", take, skip, userId],
    queryFn: () => ordersService.getOrdersAdmin({ take, skip, userId }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!take && !!skip,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: () => queryClient.getQueryData(["orders", take, skip]),
  });
};
