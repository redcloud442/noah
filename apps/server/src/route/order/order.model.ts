import prisma from "../../utils/prisma.js";

export const orderGetModel = async (params: {
  userId: string;
  take: number;
  skip: number;
}) => {
  const { take, skip, userId } = params;

  const offset = (skip - 1) * take;

  const orders = await prisma.order_table.findMany({
    where: {
      order_user_id: userId,
    },
    select: {
      order_id: true,
      order_number: true,
      order_total: true,
      order_status: true,
      order_created_at: true,
      order_address: true,
      order_first_name: true,
      order_last_name: true,
      order_email: true,
      order_phone: true,
      order_postal_code: true,
      order_city: true,
      order_state: true,
    },
    take,
    skip: offset,
  });

  const count = await prisma.order_table.count({
    where: {
      order_user_id: userId,
    },
  });

  return { orders, count };
};

export const orderGetItemsModel = async (params: { orderNumber: string }) => {
  const { orderNumber } = params;

  const orderItems = await prisma.order_table.findMany({
    where: {
      order_number: orderNumber,
    },
    select: {
      order_items: {
        select: {
          order_item_id: true,
          quantity: true,
          price: true,
          product_variant: {
            select: {
              product_variant_id: true,
              product_variant_size: true,
              product_variant_color: true,
              product_variant_quantity: true,
              product_variant_slug: true,
              variant_sample_images: {
                select: {
                  variant_sample_image_image_url: true,
                },
              },
              product_variant_product: {
                select: {
                  product_id: true,
                  product_name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const formattedOrderItems = orderItems.flatMap((order) =>
    order.order_items.map((item) => ({
      order_item_id: item.order_item_id,
      quantity: item.quantity,
      price: item.price,
      product_variant_id: item.product_variant.product_variant_id,
      product_variant_size: item.product_variant.product_variant_size,
      product_variant_color: item.product_variant.product_variant_color,
      product_variant_quantity: item.product_variant.product_variant_quantity,
      product_variant_name:
        item.product_variant.product_variant_product.product_name,
      product_variant_image:
        item.product_variant.variant_sample_images.length > 0
          ? item.product_variant.variant_sample_images[0]
              .variant_sample_image_image_url
          : null,
    }))
  );

  return formattedOrderItems;
};
