import { PaymentRedirectPage } from "@/components/PaymentRedirectPage/PaymentRedirectPage";
import prisma from "@/utils/prisma/prisma";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const page = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ payment_intent_id: string }>;
  params: Promise<{ paymentNumber: string }>;
}) => {
  const { payment_intent_id } = await searchParams;
  const { paymentNumber } = await params;

  const payment = await prisma.order_table.findUnique({
    where: {
      order_number: paymentNumber,
      order_status: {
        in: ["PAID", "CANCELED", "UNPAID"],
      },
      order_is_notified: false,
    },
    select: {
      order_status: true,
      order_email: true,
      order_number: true,
    },
  });

  if (!payment) {
    return redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-gray-100/20">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      }
    >
      <PaymentRedirectPage
        paymentNumber={paymentNumber}
        paymentIntentId={payment_intent_id}
        email={payment.order_email}
      />
    </Suspense>
  );
};

export default page;
