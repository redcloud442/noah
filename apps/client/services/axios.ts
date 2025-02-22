import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
