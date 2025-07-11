import { PaymentRedirectPage } from "@/components/PaymentRedirectPage/PaymentRedirectPage";
import prisma from "@/utils/prisma/prisma";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const page = async ({
  params,
}: {
  params: Promise<{ paymentNumber: string }>;
}) => {
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
      order_payment_id: true,
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
        paymentIntentId={payment.order_payment_id}
        email={payment.order_email}
      />
    </Suspense>
  );
};

export default page;
