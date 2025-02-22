import { apiClient } from "./axios";

export const authService = {
  login: async (
    email: string,
    firstName?: string,
    lastName?: string,
    userId?: string
  ) => {
    const result = await apiClient.post("/auth/login", {
      email,
      firstName,
      lastName,
      userId,
    });

    if (result.status !== 200) {
      throw new Error("Login failed");
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
    const result = await apiClient.post("/auth/register", {
      email,
      firstName,
      lastName,
    });

    return result.data;
  },

  verifyToken: async () => {
    const result = await apiClient.get("/auth/user");
    if (result.status !== 200) {
      throw new Error("Failed to verify token");
    }
    return result.data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },
};
