import { ordersService } from "@/services/orders";
import { useQuery } from "@tanstack/react-query";

export const useOrderQuery = (take: number, skip: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", take, skip],
    queryFn: () => ordersService.getOrders({ take, skip }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    enabled: !!take && !!skip,
    placeholderData: (previousData) => previousData,
  });

  const orders = data?.orders || [];
  const count = data?.count as number;

  return { orders, count, isLoading, error };
};
