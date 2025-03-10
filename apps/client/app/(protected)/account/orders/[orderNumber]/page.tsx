import OrderDetailsPage from "@/components/OrderDetailsPage/OrderDetailsPage";
import prisma from "@/utils/prisma/prisma";
import { protectionUserMiddleware } from "@/utils/protectionMiddleware";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) => {
  const { orderNumber } = await params;

  await protectionUserMiddleware();

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
