import { Prisma } from "@prisma/client";
import prisma from "../../utils/prisma.js";
export const productCollectionModel = async (params: {
  search?: string;
  take: number;
  skip: number;
}) => {
  const { search, take, skip } = params;

  const filter: Prisma.product_category_tableWhereInput = {};
  const offset = (skip - 1) * take;

  if (search) {
    filter.product_category_name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const collections = await prisma.product_category_table.findMany({
    where: filter,
    orderBy: {
      product_category_created_at: "desc",
    },
    take,
    skip: offset,
  });

  const count = await prisma.product_category_table.count({
    where: {
      product_category_name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });

  return {
    collections,
    count,
  };
};
