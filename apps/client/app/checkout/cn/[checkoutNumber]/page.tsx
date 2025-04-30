import CheckOutNumberPage from "@/components/CheckoutOutNumberPage/CheckOutNumberPage";
import prisma from "@/utils/prisma/prisma";
import { AddressCreateFormData } from "@/utils/schema";
import { createClient } from "@/utils/supabase/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ checkoutNumber: string }>;
}) => {
  const { checkoutNumber } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  //   const order = !!(await prisma.order_table.findUnique({
  //     where: {
  //       order_number: checkoutNumber,
  //     },
  //     select: {
  //       order_id: true,
  //     },
  //   }));

  //   if (!order) {
  //     return redirect("/");
  //   }

  const address = await prisma.user_address_table.findFirstOrThrow({
    where: {
      user_address_user_id: user?.id,
      user_address_is_default: true,
    },
  });

  const formattedAddress: AddressCreateFormData = {
    email: address?.user_address_email || "",
    firstName: address?.user_address_first_name || "",
    lastName: address?.user_address_last_name || "",
    address: address?.user_address_address || "",
    province: address?.user_address_state || "",
    city: address?.user_address_city || "",
    barangay: address?.user_address_barangay || "",
    postalCode: address?.user_address_postal_code || "",
    phone: address?.user_address_phone || "",
    is_default: address?.user_address_is_default || false,
  };

  return <CheckOutNumberPage formattedAddress={formattedAddress} />;
};

export default page;
