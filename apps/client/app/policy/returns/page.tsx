import ReturnPolicyPage from "@/components/ReturnPolicyPage/ReturnPolicyPage";
import { ScrollArea } from "@/components/ui/scroll-area";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen h-full pt-24 px-10">
      <h1 className="text-2xl font-bold">Returns Policy</h1>
      <ScrollArea className="w-full h-[700px] flex flex-col items-center justify-center">
        <ReturnPolicyPage />
      </ScrollArea>
    </div>
  );
};

export default page;
