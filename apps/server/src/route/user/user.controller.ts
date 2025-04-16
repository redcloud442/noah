import type { Context } from "hono";
import { getUserModel } from "./user.model.js";

export const getUserController = async (c: Context) => {
  try {
    const user = c.get("user");

    const userData = await getUserModel({
      userId: user.id,
      activeTeamId: user.activeTeamId,
    });

    return c.json(userData);
  } catch (error) {
    console.log(error);
    return c.json({ message: "Internal server error" }, 500);
  }
};
