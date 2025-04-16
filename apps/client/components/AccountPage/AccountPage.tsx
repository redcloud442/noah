"use client";

import { Separator } from "@/components/ui/separator";
import useUserDataStore from "@/lib/userDataStore";
import TabButton from "./TabContents/Tabs";

type AccountPageProps = {
  tab?: string;
};

const AccountPage = ({ tab }: AccountPageProps) => {
  const { userData } = useUserDataStore();

  return (
    <div className="flex flex-col justify-center px-6 text-black space-y-6">
      <div className="flex items-end justify-between gap-2">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-3xl">
          Account Dashboard
        </h1>

        <p className="text-sm text-black">
          {userData && (
            <>
              Welcome , {userData?.userProfile?.user_first_name}{" "}
              {userData?.userProfile?.user_last_name}
            </>
          )}
        </p>
      </div>

      <Separator className="my-4" />

      <TabButton tab={tab || "orders"} />
    </div>
  );
};

export default AccountPage;
