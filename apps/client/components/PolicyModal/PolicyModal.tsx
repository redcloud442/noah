import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
type PolicyModalProps = {
  title: string;
  description: string;
  content: React.ReactNode;
};

const PolicyModal = ({ title, description, content }: PolicyModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className=" cursor-pointer underline">{title}</p>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <ScrollArea className="h-[500px]">{content}</ScrollArea>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyModal;
