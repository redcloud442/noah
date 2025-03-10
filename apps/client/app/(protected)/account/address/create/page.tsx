import AddressPage from "@/components/AccountPage/TabContents/AddressPage/AddressPage";
import { protectionUserMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionUserMiddleware();

  return <AddressPage type="create" />;
};

export default page;
