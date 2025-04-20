import type { Context } from "hono";
import {
  resellerDashboardModel,
  resellerGetListModel,
} from "./reseller.model.js";

export const resellerController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { take, skip } = c.get("params");

    const resellers = await resellerGetListModel({
      take,
      skip,
      teamMemberId: user.user_metadata.teamMemberId,
    });

    return c.json(resellers);
  } catch (error) {
    return c.json(
      {
        message: "Internal server error",
        error: error,
      },
      500
    );
  }
};

export const resellerDashboardController = async (c: Context) => {
  try {
    const user = c.get("user");

    const reseller = await resellerDashboardModel({
      resellerId: user.user_metadata.resellerId,
    });

    return c.json(reseller);
  } catch (error) {
    return c.json(
      {
        message: "Internal server error",
        error: error,
      },
      500
    );
  }
};
