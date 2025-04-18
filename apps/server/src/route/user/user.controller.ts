import type { Context } from "hono";
import { getUserListModel, getUserModel } from "./user.model.js";

export const getUserController = async (c: Context) => {
  try {
    const user = c.get("user");

    const userData = await getUserModel({
      userId: user.id,
      activeTeamId: user.activeTeamId,
    });

    return c.json(userData);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
};

export const getUserListController = async (c: Context) => {
  try {
    const params = c.get("params");

    const userData = await getUserListModel(params);

    return c.json(userData, 200);
  } catch (error) {
    return c.json({ message: "Internal server error" }, 500);
  }
};
