import CheckoutNumberPage from "@/components/checkoutPage/page";

const page = async ({
  params,
}: {
  params: Promise<{ checkoutNumber: string }>;
}) => {
  const { checkoutNumber } = await params;

  if (!checkoutNumber) {
    return <div>Checkout number not found</div>;
  }
  
  return <CheckoutNumberPage />;
};

export default page;
