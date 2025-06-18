import TermsOfServicePage from "@/components/TermsOfService/TermsOfServicePage";
import { ScrollArea } from "@/components/ui/scroll-area";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen pt-24 px-10">
      <h1 className="text-2xl font-bold">Terms of Service</h1>
      <ScrollArea className="w-full h-[700px] flex flex-col items-center justify-center">
        <TermsOfServicePage />
      </ScrollArea>
    </div>
  );
};

export default page;
