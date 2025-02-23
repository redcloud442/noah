import CheckoutNumberPage from "@/components/checkoutPage/CheckoutPage";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ checkoutNumber: string }>;
}) => {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const { checkoutNumber } = await params;

  if (!user.data.user) {
    const checkoutToken = (await cookies()).get("checkout_token");
    if (!checkoutToken) {
      return redirect("/");
    }
  }

  if (!checkoutNumber) {
    return redirect("/");
  }

  return <CheckoutNumberPage />;
};

export default page;
