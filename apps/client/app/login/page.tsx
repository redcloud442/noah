import LoginPage from "@/components/LoginPage/LoginPage";
import { protectionPublicMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionPublicMiddleware();

  return <LoginPage />;
};

export default page;
