import axios from "axios";

export const authService = {
  getUser: async () => {
    const response = await axios.get("/user");

    return response.data;
  },
  login: async (params: { email: string }) => {
    const { email } = params;

    const response = await axios.post("/auth/login/reseller", {
      email,
    });

    return response.data;
  },
};
