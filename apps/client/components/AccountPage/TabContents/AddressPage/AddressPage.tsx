"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateAddress, useUpdateAddress } from "@/query/addressQuery";
import { deliveryOptions } from "@/utils/constant";
import { AddressCreateFormData, addressCreateSchema } from "@/utils/schema";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Building,
  Home,
  Loader2,
  Mail,
  Map,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

type Props = {
  type: "create" | "update";
  address?: AddressCreateFormData;
};

const AddressPage = ({ type = "create", address }: Props) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    // setValue,
    formState: { errors },
  } = useForm<AddressCreateFormData>({
    resolver: zodResolver(addressCreateSchema),
    defaultValues:
      type === "create"
        ? {
            email: "",
            firstName: "",
            lastName: "",
            address: "",
            province: "",
            city: "",
            postalCode: "",
            phone: "",
            is_default: false,
          }
        : address,
  });

  // const [provices, setProvices] = useState<
  //   {
  //     code: string;
  //     name: string;
  //     regionName: string;
  //     islandGroupCode: string;
  //   }[]
  // >([]);

  // const [cities, setCities] = useState<
  //   { code: string; name: string; province_code: string }[]
  // >([]);
  // const [barangays, setBarangays] = useState<
  //   { code: string; name: string; city_code: string }[]
  // >([]);

  // const selectedProvince = watch("province");
  // const selectedCity = watch("city");

  // useEffect(() => {
  //   const fetchProvinces = async () => {
  //     try {
  //       const res = await axios.get("https://psgc.gitlab.io/api/provinces/");
  //       setProvices(res.data);

  //       if (type === "update" && address?.province) {
  //         const provinceData = res.data.find(
  //           (p: { name: string }) => p.name === address.province
  //         );
  //         if (provinceData) {
  //           setValue("province", provinceData.code);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching provinces:", error);
  //     }
  //   };

  //   fetchProvinces();
  // }, [type, address, setValue]);

  // useEffect(() => {
  //   if (selectedProvince) {
  //     const fetchCities = async () => {
  //       try {
  //         const res = await axios.get(
  //           `https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities/`
  //         );
  //         setCities(res.data);
  //         setValue("barangay", "");
  //       } catch (error) {
  //         console.error("Error fetching cities:", error);
  //       }
  //     };
  //     fetchCities();
  //   }
  // }, [selectedProvince, setValue]);

  // useEffect(() => {
  //   if (selectedCity) {
  //     const fetchBarangays = async () => {
  //       try {
  //         const res = await axios.get(
  //           `https://psgc.gitlab.io/api/provinces/${selectedProvince}/barangays/`
  //         );

  //         setBarangays(res.data);
  //       } catch (error) {
  //         console.error("Error fetching barangays:", error);
  //       }
  //     };
  //     fetchBarangays();
  //   }
  // }, [selectedCity, setValue]);

  const { mutate: createAddress, isPending: isCreating } = useCreateAddress();
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress();

  const onSubmit = async (data: AddressCreateFormData) => {
    try {
      if (type === "create") {
        createAddress(data);

        toast({
          title: "Address created successfully",
        });
        setTimeout(() => {
          router.push("/account/address");
        }, 1000);
      } else {
        updateAddress({ data, addressId: params.addressId as string });
        toast({
          title: "Address updated successfully",
        });
        setTimeout(() => {
          router.push("/account/address");
        }, 1000);
      }

      toast({
        title: `${
          type === "create" ? "Address created" : "Address updated"
        } successfully`,
      });
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-zinc-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === "create" ? "Add New Address" : "Update Address"}
          </h1>
          <p className="text-gray-600">
            {type === "create"
              ? "Add a delivery address for your orders"
              : "Update your delivery address information"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="p-8 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-zinc-100 rounded-full">
                  <User className="w-4 h-4 text-zinc-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    {...register("email", { required: true })}
                    type="email"
                    placeholder="Enter your email address"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-black"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">Email is required</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </Label>
                    <Input
                      {...register("firstName", { required: true })}
                      type="text"
                      placeholder="Enter first name"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-black"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">
                        First name is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </Label>
                    <Input
                      {...register("lastName", { required: true })}
                      type="text"
                      placeholder="Enter last name"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-black"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">
                        Last name is required
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <span className="text-sm font-medium">🇵🇭 +63</span>
                    </div>
                    <Input
                      type="text"
                      placeholder="9XX XXX XXXX"
                      {...register("phone", { required: true })}
                      className="h-12 pl-20 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-black"
                      maxLength={10}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value.startsWith("9")) {
                          e.target.value = "9";
                        }
                      }}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600">
                      Phone number is required
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-zinc-100 rounded-full">
                  <Home className="w-4 h-4 text-zinc-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Address Details
                </h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Building className="w-4 h-4" />
                    Street Address
                  </Label>
                  <Input
                    {...register("address", { required: true })}
                    type="text"
                    placeholder="House/Unit number, Street name"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-black"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">Address is required</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="shippingFee"
                    className="text-sm font-medium text-gray-700 mb-2 block"
                  >
                    Delivery Option
                  </Label>
                  <Controller
                    name="shippingOption"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="text-black">
                          <SelectValue placeholder="Select a delivery option" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryOptions.map((option) => (
                            <SelectItem key={option.label} value={option.label}>
                              {option.label} - ₱{option.rate.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="province"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Province
                  </Label>
                  <Controller
                    name="province"
                    control={control}
                    defaultValue={address?.province || ""}
                    render={({ field }) => (
                      <>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Doe"
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-black"
                        />
                      </>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-sm font-medium text-gray-700"
                    >
                      City/Municipality
                    </Label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Doe"
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-black"
                          />
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="barangay"
                      className="text-sm font-medium text-gray-700"
                    >
                      Barangay
                    </Label>
                    <Controller
                      name="barangay"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Doe"
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-black"
                          />
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="postalCode"
                    className="text-sm font-medium text-gray-700"
                  >
                    Postal Code
                  </Label>
                  <Input
                    {...register("postalCode", { required: true })}
                    type="text"
                    placeholder="Enter postal code"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-black"
                    maxLength={4}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-600">
                      Postal code is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <Button
              type="submit"
              variant="secondary"
              className="w-full h-12 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {type === "create"
                    ? "Creating Address..."
                    : "Updating Address..."}
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 mr-2" />
                  {type === "create" ? "Create Address" : "Update Address"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressPage;
