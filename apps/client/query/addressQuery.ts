import { addressService } from "@/services/address";
import { AddressCreateFormData } from "@/utils/schema";
import { user_address_table } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAddressQuery = (take: number, skip: number) => {
  return useQuery({
    queryKey: ["address", take, skip],
    queryFn: () => addressService.getAddresses({ take, skip }),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    select: (data) => ({
      address: data.address,
      count: data.count,
    }),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddressCreateFormData) => {
      await addressService.createAddress(data);
    },
    onMutate: async (data: AddressCreateFormData) => {
      await queryClient.cancelQueries({
        queryKey: ["address", 15, 1],
      });

      const previousData = queryClient.getQueryData(["address", 15, 1]);

      if (previousData) {
        queryClient.setQueryData(
          ["address", 15, 1],
          (oldData: { address: user_address_table[]; count: number }) => {
            return {
              address: [...oldData.address, data],
              count: oldData.count + 1,
            };
          }
        );
      }

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Address created successfully");
    },
    onError: (error, data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["address", 15, 1], context?.previousData);
      }
      toast.error("Failed to create address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["address"],
      });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      data: AddressCreateFormData;
      addressId: string;
    }) => {
      await addressService.updateAddress(params.data, params.addressId);
    },
    onMutate: async (params: {
      data: AddressCreateFormData;
      addressId: string;
    }) => {
      await queryClient.cancelQueries({
        queryKey: ["address", 15, 1],
      });

      const previousData = queryClient.getQueryData(["address", 15, 1]);

      queryClient.setQueryData(
        ["address", 15, 1],
        (oldData: { address: user_address_table[]; count: number }) => {
          return {
            address: oldData.address.map((address) =>
              address.user_address_id === params.addressId
                ? params.data
                : address
            ),
            count: oldData.count,
          };
        }
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Address updated successfully");
    },
    onError: (error, data, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["address", 15, 1], context?.previousData);
      }
      toast.error("Failed to update address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["address"],
      });
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

      const previousData = queryClient.getQueryData<{
        address: user_address_table[];
        count: number;
      }>(["address", 15, activePage]);

      if (!previousData) return;

      queryClient.setQueryData(
        ["address", 15, activePage],
        (oldData: { address: user_address_table[]; count: number }) => {
          const updatedAddresses = oldData.address.map((address) => ({
            ...address,
            user_address_is_default: address.user_address_id === addressId,
          }));

          return {
            address: updatedAddresses,
            count: oldData.count,
          };
        }
      );

      return { previousData };
    },

    onError: (err, addressId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["address", 15, activePage],
          context.previousData
        );
      }
      toast.error("Failed to set address as default");
    },

    onSuccess: () => {
      toast.success("Address set as default");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["address"],
      });
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
      await queryClient.cancelQueries({
        queryKey: ["address", 15, activePage],
      });

      const previousData = queryClient.getQueryData([
        "address",
        15,
        activePage,
      ]);

      if (!previousData) return;

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
      if (context?.previousData) {
        queryClient.setQueryData(
          ["address", 15, activePage],
          context?.previousData
        );
      }
      toast.error("Failed to delete address");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["address"],
      });
    },
  });
};
