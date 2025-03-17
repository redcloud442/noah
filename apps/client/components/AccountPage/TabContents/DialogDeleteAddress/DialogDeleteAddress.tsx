import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteAddress } from "@/query/addressQuery";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export const DialogDeleteAddress = ({
  addressId,
  activePage,
  deleteUserFunction,
}: {
  addressId: string;
  activePage: number;
  deleteUserFunction: (addressId: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { isPending: isMutating } = useDeleteAddress(activePage);

  const handleDeleteAddress = async (addressId: string) => {
    try {
      deleteUserFunction(addressId);

      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="destructive">
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this address?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            address and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isMutating}
            variant="destructive"
            onClick={() => handleDeleteAddress(addressId)}
          >
            {isMutating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
