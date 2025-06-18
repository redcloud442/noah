import OrderDetailsPage from "@/components/OrderDetailsPage/OrderDetailsPage";
import prisma from "@/utils/prisma/prisma";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) => {
  const { orderNumber } = await params;

  const order = await prisma.order_table.findUnique({
    where: {
      order_number: orderNumber,
    },
  });

  if (!order) {
    redirect("/account");
  }

  return <OrderDetailsPage order={order} />;
};

export default page;
