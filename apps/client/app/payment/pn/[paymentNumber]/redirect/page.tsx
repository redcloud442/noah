import { PaymentRedirectPage } from "@/components/PaymentRedirectPage/PaymentRedirectPage";
import prisma from "@/utils/prisma/prisma";
import { redirect } from "next/navigation";

const page = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ payment_intent_id: string }>;
  params: Promise<{ paymentNumber: string }>;
}) => {
  const { payment_intent_id } = await searchParams;
  const { paymentNumber } = await params;

  const payment = !!(await prisma.order_table.findUnique({
    where: {
      order_number: paymentNumber,
      order_status: "PENDING",
    },
    select: {
      order_status: true,
    },
  }));

  if (!payment) {
    return redirect("/");
  }

  return (
    <PaymentRedirectPage
      paymentNumber={paymentNumber}
      paymentIntentId={payment_intent_id}
    />
  );
};

export default page;
