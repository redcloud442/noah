import AccountPage from "@/components/AccountPage/AccountPage";
import { protectionUserMiddleware } from "@/utils/protectionMiddleware";
import { redirect } from "next/navigation";
const AddressPage = async ({
  params,
}: {
  params: Promise<{ tab: "orders" | "address" }>;
}) => {
  const { tab } = await params;

  if (!["orders", "address"].includes(tab)) {
    return redirect("/account/orders");
  }

  await protectionUserMiddleware();

  return <AccountPage />;
};

export default AddressPage;
