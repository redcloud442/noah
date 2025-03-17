import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAddress, useSetDefaultAddress } from "@/query/addressQuery";
import { user_address_table } from "@prisma/client";
import { Stars } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { DialogDeleteAddress } from "./DialogDeleteAddress/DialogDeleteAddress";

type AddressContentProps = {
  address: user_address_table[];
  count: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  activePage: number;
  isLoading: boolean;
};

const AddressContent = ({
  address,
  count,
  setActivePage,
  activePage,
  isLoading,
}: AddressContentProps) => {
  const pageCount = count > 0 ? Math.ceil(count / 15) : 1;

  const { mutate: setDefaultAddress, isPending: isMutating } =
    useSetDefaultAddress(activePage);

  const { mutate: deleteAddress } = useDeleteAddress(activePage);

  const handleSetDefaultAddress = (addressId: string) => {
    setDefaultAddress(addressId);
  };

  return (
    <div className="w-full max-w-4xl sm:max-w-none px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold my-4">Saved Addresses</h2>
        <Link href="/account/address/create">
          <Button variant="secondary">Add New Address</Button>
        </Link>
      </div>
      <p className="text-gray-600">
        Manage your shipping and billing addresses below.
      </p>

      {isLoading ? (
        <div className="flex justify-center flex-col gap-4 mt-6">
          <Skeleton className="w-full bg-gray-200 h-32" />
          <Skeleton className="w-full bg-gray-200 max-w-6xl h-32" />
          <Skeleton className="w-full bg-gray-200 max-w-4xl h-32" />
        </div>
      ) : address.length === 0 ? (
        <p className="mt-6 text-gray-500">No addresses found.</p>
      ) : (
        <>
          <ul className="space-y-4 mt-6">
            {address.map((address) => (
              <li
                key={address.user_address_id}
                className={`p-5 border border-gray-200 rounded-lg shadow-md bg-white flex flex-col md:flex-row justify-between items-start md:items-start ${
                  address.user_address_is_default ? "border-yellow-500" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">
                      {address.user_address_first_name}{" "}
                      {address.user_address_last_name}
                    </p>
                    {address.user_address_is_default && (
                      <Stars className="text-yellow-500 w-5 h-5" />
                    )}
                  </div>
                  <p className="text-gray-500">
                    {address.user_address_address}
                  </p>
                  <p className="text-gray-500">
                    {address.user_address_email}, +63{" "}
                    {address.user_address_phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.user_address_is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleSetDefaultAddress(address.user_address_id)
                      }
                      disabled={isMutating} // Disable the button while mutation is in progress
                    >
                      {isMutating ? "Setting..." : "Set as Default"}
                    </Button>
                  )}
                  <Link href={`/account/address/${address.user_address_id}`}>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </Link>

                  <DialogDeleteAddress
                    deleteUserFunction={deleteAddress}
                    activePage={activePage}
                    addressId={address.user_address_id}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {count > 0 && (
        <Pagination
          activePage={activePage}
          setActivePage={setActivePage}
          pageCount={pageCount}
        />
      )}
    </div>
  );
};

export default AddressContent;
