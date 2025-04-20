import CheckOutNumberPage from "@/components/CheckoutOutNumberPage/CheckOutNumberPage";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ checkoutNumber: string }>;
}) => {
  const { checkoutNumber } = await params;

  const checkoutToken = (await cookies()).get("checkout_token");

  if (!checkoutToken) {
    return redirect("/");
  }

  const decoded = jwt.verify(checkoutToken?.value, process.env.JWT_SECRET!) as {
    checkoutNumber: string;
    role: string;
    referralCode: string;
  };

  if (decoded.checkoutNumber !== checkoutNumber) {
    return redirect("/");
  }

  if (!checkoutNumber) {
    return redirect("/");
  }

  return <CheckOutNumberPage />;
};

export default page;
