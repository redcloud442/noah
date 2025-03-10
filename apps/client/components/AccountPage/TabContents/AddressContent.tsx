import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { addressService } from "@/services/address";
import { user_address_table } from "@prisma/client";
import { Stars } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DialogDeleteAddress } from "./DialogDeleteAddress/DialogDeleteAddress";

const AddressContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<user_address_table[]>([]);
  const [count, setCount] = useState(0);
  const [activePage, setActivePage] = useState(1);

  const pageCount = count > 0 ? Math.ceil(count / 15) : 1;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const addresses = await addressService.getAddresses({
          take: 15,
          skip: activePage,
        });

        setAddresses(addresses.address);
        setCount(addresses.count);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [activePage]);

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressService.setDefaultAddress(addressId);

      setAddresses((prevAddresses) =>
        prevAddresses.map((address) => ({
          ...address,
          user_address_is_default: address.user_address_id === addressId,
        }))
      );
    } catch (error) {
      console.error("Error setting default address:", error);
    }
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
      ) : addresses.length === 0 ? (
        <p className="mt-6 text-gray-500">No addresses found.</p>
      ) : (
        <>
          <ul className="space-y-4 mt-6">
            {addresses.map((address) => (
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
                      onClick={() => handleSetDefault(address.user_address_id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Link href={`/account/address/${address.user_address_id}`}>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </Link>

                  <DialogDeleteAddress addressId={address.user_address_id} />
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
