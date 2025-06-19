import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAddress, useSetDefaultAddress } from "@/query/addressQuery";
import { user_address_table } from "@prisma/client";
import {
  Building2,
  Crown,
  Edit3,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
} from "lucide-react";
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

  // Enhanced loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4 mt-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-5 w-48 bg-gray-200" />
              <Skeleton className="h-4 w-64 bg-gray-200" />
              <Skeleton className="h-4 w-56 bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 bg-gray-200" />
              <Skeleton className="h-8 w-16 bg-gray-200" />
              <Skeleton className="h-8 w-8 bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200 mt-8">
      <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No addresses yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Add your first address to make checkout faster and easier.
      </p>
      <Link href="/account/address/create">
        <Button className="inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Address
        </Button>
      </Link>
    </div>
  );

  // Address type indicator
  const getAddressIcon = (addressType?: string) => {
    switch (addressType?.toLowerCase()) {
      case "home":
        return <Home className="w-4 h-4 text-blue-500" />;
      case "office":
      case "work":
        return <Building2 className="w-4 h-4 text-purple-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Addresses
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Manage your shipping and billing addresses
            </p>
          </div>
          <Link href="/account/address/create">
            <Button
              variant="secondary"
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Address
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        {count > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {count} {count === 1 ? "address" : "addresses"}
              </span>
              {address.find((addr) => addr.user_address_is_default) && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Crown className="w-4 h-4" />1 default address
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : address.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {address.map((addr) => (
            <div
              key={addr.user_address_id}
              className={`
                relative bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 p-6
                ${
                  addr.user_address_is_default
                    ? "border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-amber-100"
                    : "border-gray-100 hover:border-gray-200"
                }
              `}
            >
              {/* Default badge */}
              {addr.user_address_is_default && (
                <div className="absolute top-4 right-4">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                    <Crown className="w-3 h-3" />
                    Default
                  </div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row justify-between gap-6">
                {/* Address Info */}
                <div className="flex-1 space-y-3">
                  {/* Name and Address Type */}
                  <div className="flex items-start gap-3">
                    {getAddressIcon(
                      addr.user_address_is_default ? "default" : "home"
                    )}
                  </div>

                  {/* Address Details */}
                  <div className="space-y-2 ml-7">
                    <div className="flex items-start gap-2 text-gray-700">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="leading-relaxed">
                        {addr.user_address_address}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {addr.user_address_email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          +63 {addr.user_address_phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-start justify-end gap-2 lg:flex-col lg:items-end">
                  <div className="flex gap-2">
                    {!addr.user_address_is_default && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          handleSetDefaultAddress(addr.user_address_id)
                        }
                        disabled={isMutating}
                        className="inline-flex items-center gap-2 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors"
                      >
                        <Star className="w-3 h-3" />
                        {isMutating ? "Setting..." : "Set Default"}
                      </Button>
                    )}

                    <Link href={`/account/address/${addr.user_address_id}`}>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="inline-flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </Button>
                    </Link>

                    <DialogDeleteAddress
                      deleteUserFunction={deleteAddress}
                      activePage={activePage}
                      addressId={addr.user_address_id}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {count > 15 && (
        <div className="mt-12 flex justify-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <Pagination
              activePage={activePage}
              handleChangePage={setActivePage}
              pageCount={pageCount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressContent;
