import { Product, teamMemberProfile } from "@/utils/types";
import { user_table } from "@prisma/client";
import axios from "axios";

export const authService = {
  login: async (
    email: string,
    firstName?: string,
    lastName?: string,
    userId?: string,
    cart?: Product[]
  ) => {
    const result = await axios.post("/api/v1/auth/login", {
      email,
      firstName,
      lastName,
      userId,
      cart,
    });

    if (result.status !== 200) {
      throw new Error(result.data.error);
    }

    return result.data as {
      redirectTo: string;
    };
  },

  callback: async (params: {
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    cart?: Product[];
  }) => {
    const result = await axios.post("/api/v1/auth/callback", params);

    if (result.status !== 200) {
      throw new Error("Callback failed");
    }

    return result.data;
  },

  saveCart: async (cart: Product[]) => {
    const result = await axios.post("/api/v1/auth/save-cart", {
      cart,
    });

    if (result.status !== 200) {
      throw new Error("Save cart failed");
    }

    return result.data;
  },

  register: async ({
    email,
    firstName,
    lastName,
  }: {
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    const result = await axios.post("/api/v1/auth/register", {
      email,
      firstName,
      lastName,
    });

    return result.data;
  },

  createCheckoutToken: async (
    checkoutNumber: string,
    referralCode?: string
  ) => {
    const result = await axios.post("/auth/checkout-token", {
      checkoutNumber,
      referralCode,
    });
    if (result.status !== 200) {
      throw new Error("Failed to create checkout token");
    }
    return result.data;
  },

  getUser: async () => {
    const result = await axios.get("/api/v1/user");
    if (result.status !== 200) {
      throw new Error("Failed to get user");
    }

    return result.data as {
      userProfile: user_table;
      teamMemberProfile: teamMemberProfile;
    };
  },

  verifyCheckoutToken: async () => {
    const result = await axios.get(`/api/v1/auth/verify-checkout-token`);
    if (result.status !== 200) {
      throw new Error("Failed to verify checkout token");
    }
    return result.data;
  },

  deleteCheckoutToken: async () => {
    const result = await axios.post("/auth/delete-checkout-token");
    if (result.status !== 200) {
      throw new Error("Failed to delete checkout token");
    }
    return result.data;
  },

  logout: async () => {
    await axios.post("/api/v1/auth/logout");
  },
};
