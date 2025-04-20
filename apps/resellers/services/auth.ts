import { apiClient } from "@/utils/axios/axios";

export const authService = {
  getUser: async () => {
    const response = await apiClient.get("/user");

    return response.data;
  },
  login: async (params: { email: string }) => {
    const { email } = params;

    const response = await apiClient.post("/auth/login/reseller", {
      email,
    });

    return response.data;
  },
};
