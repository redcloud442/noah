import { addressService } from "@/services/address";
import { AddressCreateFormData } from "@packages/shared/src/schema/schema";
import { user_address_table } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddressQuery = (take: number, skip: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["address", take, skip],
    queryFn: () => addressService.getAddresses({ take, skip }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled: !!take && !!skip,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: () => queryClient.getQueryData(["address", take, skip]),
  });
};

export const useCreateAddress = () => {
  return useMutation({
    mutationFn: async (data: AddressCreateFormData) => {
      await addressService.createAddress(data);
    },
    onSuccess: () => {
      toast.success("Address created successfully");
    },
    onError: () => {
      toast.error("Failed to create address");
    },
  });
};

export const useUpdateAddress = () => {
  return useMutation({
    mutationFn: async (params: {
      data: AddressCreateFormData;
      addressId: string;
    }) => {
      await addressService.updateAddress(params.data, params.addressId);
    },
    onSuccess: () => {
      toast.success("Address updated successfully");
    },
    onError: () => {
      toast.error("Failed to update address");
    },
  });
};

export const useSetDefaultAddress = (activePage: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      await addressService.setDefaultAddress(addressId);
    },
    onMutate: async (addressId: string) => {
      await queryClient.cancelQueries({
        queryKey: ["address", 15, activePage],
      });

      const previousData = queryClient.getQueryData([
        "address",
        15,
        activePage,
      ]);

      queryClient.setQueryData(
        ["address", 15, activePage],
        (oldData: { address: user_address_table[] }) => {
          if (!oldData) return oldData;

          const updatedAddresses = oldData.address.map(
            (address: user_address_table) => ({
              ...address,
              user_address_is_default: address.user_address_id === addressId,
            })
          );

          return {
            ...oldData,
            addresses: updatedAddresses,
          };
        }
      );

      return { previousData };
    },

    onError: (err, addressId, context) => {
      queryClient.setQueryData(
        ["address", 15, activePage],
        context?.previousData
      );
      toast.error("Failed to set address as default");
    },

    onSuccess: () => {
      // Corrected the query invalidation
      queryClient.invalidateQueries({
        queryKey: ["address", 15, activePage],
      });
      toast.success("Address set as default");
    },
  });
};

export const useDeleteAddress = (activePage: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: string) => {
      await addressService.deleteAddress(addressId);
    },
    onMutate: async (addressId: string) => {
      const previousData = queryClient.getQueryData([
        "address",
        15,
        activePage,
      ]);

      queryClient.setQueryData(
        ["address", 15, activePage],
        (oldData: { address: user_address_table[]; count: number }) => {
          return {
            address: oldData.address.filter(
              (address) => address.user_address_id !== addressId
            ),
            count: oldData.count - 1,
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["address", 15, activePage],
      });
      toast.success("Address deleted successfully");
    },
    onError: (error, addressId, context) => {
      // Roll back the optimistic update if the mutation fails
      queryClient.setQueryData(
        ["address", 15, activePage],
        context?.previousData
      );
      toast.error("Failed to delete address");
    },
  });
};
