import axios from "axios";

export const authService = {
  getUser: async () => {
    const response = await axios.get("/api/v1/user");

    return response.data;
  },
  login: async (params: { email: string }) => {
    const { email } = params;

    const response = await axios.post("/api/v1/auth/login/reseller", {
      email,
    });

    return response.data;
  },
};
