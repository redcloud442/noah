import AddressPage from "@/components/AccountPage/TabContents/AddressPage/AddressPage";
import prisma from "@/utils/prisma/prisma";
import { protectionUserMiddleware } from "@/utils/protectionMiddleware";
import { AddressCreateFormData } from "@packages/shared";

const page = async (params: Promise<{ addressId: string }>) => {
  const { addressId } = await params;

  await protectionUserMiddleware();

  const address = await prisma.user_address_table.findFirst({
    where: {
      user_address_id: addressId,
    },
    select: {
      user_address_id: true,
      user_address_email: true,
      user_address_first_name: true,
      user_address_last_name: true,
      user_address_address: true,
      user_address_city: true,
      user_address_state: true,
      user_address_barangay: true,
      user_address_phone: true,
      user_address_postal_code: true,
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

  return <AddressPage type="update" address={formattedAddress} />;
};

export default page;
