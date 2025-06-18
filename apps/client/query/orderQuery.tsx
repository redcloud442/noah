import { ordersService } from "@/services/orders";
import { useQuery } from "@tanstack/react-query";

export const useOrderQuery = (take: number, skip: number) => {
  return useQuery({
    queryKey: ["orders", take, skip],
    queryFn: () => ordersService.getOrders({ take, skip }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!take && !!skip,
    select: (data) => ({
      orders: data.orders,
      count: data.count,
    }),
  });
};
