import prisma from "../../../prisma/prisma.js";

export const registerModel = async (email: string, password: string) => {
  const user = await prisma.user_table.create({
    data: {
      email,
      password,
    },
  });

  return user;
};
