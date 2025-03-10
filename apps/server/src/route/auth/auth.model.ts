import { sign, verify } from "hono/jwt";
import { envConfig } from "../../env.js";
import prisma from "../../utils/prisma.js";
import type { Product } from "../../utils/types.js";

const JWT_SECRET = envConfig.JWT_SECRET;

export const authLoginModel = async (params: {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  cart?: Product[];
}) => {
  const { email, firstName, lastName, userId, cart } = params;

  let userData = await prisma.user_table.findUnique({
    where: {
      user_email: email,
    },
  });

  if (!userData && firstName && lastName && userId) {
    userData = await prisma.user_table.create({
      data: {
        user_id: userId,
        user_email: email,
        user_first_name: firstName,
        user_last_name: lastName,
        user_group: {
          connect: {
            user_group_id: "79b0d3b5-f110-4874-a9b8-72777fd4257a",
          },
        },
      },
      select: {
        user_id: true,
        user_email: true,
        user_first_name: true,
        user_last_name: true,
        user_group: {
          select: {
            user_group_id: true,
            user_group_name: true,
          },
        },
        user_created_at: true,
        user_updated_at: true,
        user_profile_picture: true,
        user_group_id: true,
      },
    });
  }

  if (!userData) {
    throw new Error("User not found");
  }

  const userGroup = await prisma.user_group_table.findUnique({
    where: {
      user_group_id: userData.user_group_id,
    },
  });

  if (cart && cart.length > 0) {
    for (const item of cart) {
      await prisma.cart_table.upsert({
        where: {
          cart_user_id_cart_product_variant_id: {
            cart_user_id: userData.user_id,
            cart_product_variant_id: item.product_variant_id,
          },
        },
        update: {
          cart_quantity: {
            increment: item.product_quantity,
          },
        },
        create: {
          cart_id: item.cart_id,
          cart_quantity: item.product_quantity,
          cart_user_id: userData.user_id,
          cart_product_variant_id: item.product_variant_id,
        },
      });
    }
  }

  const customPayload = {
    id: userData.user_id,
    email: userData.user_email,
    firstName: userData.user_first_name,
    lastName: userData.user_last_name,
    avatar: userData.user_profile_picture,
    role: userGroup?.user_group_name,
  };

  const newToken = await sign(customPayload, JWT_SECRET);

  return {
    message: "Login successful",
    token: newToken,
    redirectTo: `${
      userGroup?.user_group_name === "ADMIN" ? "/admin" : "/account/orders"
    }`,
  };
};

export const authRegisterModel = async (params: {
  email: string;
  firstName: string;
  lastName: string;
  userId: string;
  cart?: Product[];
}) => {
  const { userId, email, firstName, lastName, cart } = params;

  const user = await prisma.$transaction(async (tx) => {
    const userData = await tx.user_table.create({
      data: {
        user_id: userId,
        user_email: email,
        user_first_name: firstName,
        user_last_name: lastName,
        user_group: {
          connect: {
            user_group_id: "79b0d3b5-f110-4874-a9b8-72777fd4257a",
          },
        },
      },
      select: {
        user_id: true,
        user_email: true,
        user_first_name: true,
        user_last_name: true,
        user_profile_picture: true,
        user_group: {
          select: {
            user_group_id: true,
            user_group_name: true,
          },
        },
      },
    });

    return userData;
  });

  if (cart && cart.length > 0) {
    for (const item of cart) {
      await prisma.cart_table.upsert({
        where: {
          cart_user_id_cart_product_variant_id: {
            cart_user_id: user.user_id,
            cart_product_variant_id: item.product_variant_id,
          },
        },
        update: {
          cart_quantity: {
            increment: item.product_quantity,
          },
        },
        create: {
          cart_id: item.cart_id,
          cart_quantity: item.product_quantity,
          cart_user_id: user.user_id,
          cart_product_variant_id: item.product_variant_id,
        },
      });
    }
  }

  const customPayload = {
    id: user.user_id,
    email: user.user_email,
    firstName: user.user_first_name,
    lastName: user.user_last_name,
    avatar: user.user_profile_picture,
    role: user.user_group.user_group_name,
  };

  const newToken = await sign(customPayload, JWT_SECRET);

  return {
    message: "Register successful",
    token: newToken,
  };
};

export const createCheckoutTokenModel = async (params: {
  checkoutNumber: string;
}) => {
  const { checkoutNumber } = params;

  const customPayload = {
    id: checkoutNumber,
    role: "ANONYMOUS",
  };

  const newToken = await sign(customPayload, JWT_SECRET);

  return newToken;
};

export const verifyCheckoutTokenModel = async (params: { token: string }) => {
  const { token } = params;

  const decoded = await verify(token, JWT_SECRET);

  if (decoded.role !== "ANONYMOUS") {
    throw new Error("Invalid token");
  }

  return {
    message: "Checkout verified",
    success: true,
  };
};
