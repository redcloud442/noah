import { PaymentRedirectPage } from "@/components/PaymentRedirectPage/PaymentRedirectPage";

const page = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ payment_intent_id: string }>;
  params: Promise<{ paymentNumber: string }>;
}) => {
  const { payment_intent_id } = await searchParams;
  const { paymentNumber } = await params;

  return (
    <PaymentRedirectPage
      paymentNumber={paymentNumber}
      paymentIntentId={payment_intent_id}
    />
  );
};

export default page;
