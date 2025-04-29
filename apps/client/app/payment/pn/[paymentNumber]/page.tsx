import PaymentPage from "@/components/PaymentPage/PaymentPage";
import prisma from "@/utils/prisma/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ paymentNumber: string }>;
}) => {
  const { paymentNumber } = await params;

  if (!paymentNumber) {
    return redirect("/");
  }
  const payment = await prisma.order_table.findUnique({
    where: {
      order_number: paymentNumber,
      order_status: "PENDING",
    },
  });

  if (payment?.order_status !== "PENDING") {
    return redirect("/");
  }

  const checkoutToken = (await cookies()).get("checkout_token");

  const decoded = jwt.verify(
    checkoutToken?.value ?? "",
    process.env.JWT_SECRET!
  ) as unknown as {
    checkoutNumber: string;
    role: string;
    referralCode: string;
  };

  if (decoded.checkoutNumber !== paymentNumber) {
    return redirect("/");
  }

  return <PaymentPage order={payment} />;
};

export default page;
