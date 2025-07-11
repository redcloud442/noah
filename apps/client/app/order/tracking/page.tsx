import prisma from "@/utils/prisma/prisma";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  redirect("/");

  const { token } = await searchParams;

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    order_number: string;
    order_id: string;
  };

  if (!decoded) {
    return redirect("/");
  }

  const order = await prisma.order_table.findUnique({
    where: {
      order_number: decoded.order_number,
      order_status: "SHIPPED",
    },
  });

  if (!order) {
    return redirect("/");
  }

  // return (
  //   <div className="min-h-screen  text-white bg-black pt-20">
  //     <OrderDetailsPage order={order} isTracking />
  //   </div>
  // );
};

export default page;
