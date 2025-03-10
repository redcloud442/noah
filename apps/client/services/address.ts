import { AddressCreateFormData } from "@packages/shared";
import { user_address_table } from "@prisma/client";
import { apiClient } from "./axios";

export const addressService = {
  getAddresses: async (params: { take: number; skip: number }) => {
    const result = await apiClient.get("/address", { params });

    if (result.status !== 200) {
      throw new Error("Failed to get addresses");
    }

    return result.data as {
      address: user_address_table[];
      count: number;
    };
  },
  createAddress: async (data: AddressCreateFormData) => {
    const result = await apiClient.post("/address", data);

    if (result.status !== 200) {
      throw new Error("Failed to create address");
    }
  },
  updateAddress: async (data: AddressCreateFormData, address_id: string) => {
    const result = await apiClient.put(`/address/${address_id}`, data);

    if (result.status !== 200) {
      throw new Error("Failed to update address");
    }
  },
  setDefaultAddress: async (address_id: string) => {
    const result = await apiClient.put(`/address/${address_id}/default`);

    if (result.status !== 200) {
      throw new Error("Failed to set default address");
    }
  },
  deleteAddress: async (address_id: string) => {
    const result = await apiClient.delete(`/address/${address_id}`);

    if (result.status !== 200) {
      throw new Error("Failed to delete address");
    }
  },
};
