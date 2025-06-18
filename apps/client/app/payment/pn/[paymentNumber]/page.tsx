import PaymentPage from "@/components/PaymentPage/PaymentPage";
import prisma from "@/utils/prisma/prisma";
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
    },
  });

  if (!payment) {
    return redirect("/");
  }

  const cookieStore = await cookies();

  const cookieCheckout = cookieStore.get("checkout_token")?.value;
  if (!cookieCheckout) {
    return redirect("/");
  }

  return <PaymentPage order={payment} />;
};

export default page;
