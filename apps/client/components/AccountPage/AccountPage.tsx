import { Separator } from "@/components/ui/separator";
import TabButton from "./TabContents/Tabs";

type AccountPageProps = {
  tab?: string;
};

const AccountPage = ({ tab }: AccountPageProps) => {
  return (
    <div className="flex flex-col justify-center px-6 text-black space-y-6">
      <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-3xl">
        Account Dashboard
      </h1>
      <Separator className="my-4" />

      <TabButton tab={tab || "orders"} />
    </div>
  );
};

export default AccountPage;
