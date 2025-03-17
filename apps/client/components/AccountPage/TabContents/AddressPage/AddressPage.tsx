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
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressCreateFormData, addressCreateSchema } from "@packages/shared";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type Props = {
  type: "create" | "update";
  address?: AddressCreateFormData;
};

const AddressPage = ({ type = "create", address }: Props) => {
  const params = useParams();
  const router = useRouter();

  const { toast } = useToast();

  const { register, handleSubmit, watch, control, setValue } =
    useForm<AddressCreateFormData>({
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

  const [provices, setProvices] = useState<
    {
      code: string;
      name: string;
      regionName: string;
      islandGroupCode: string;
    }[]
  >([]);

  const [cities, setCities] = useState<
    { code: string; name: string; province_code: string }[]
  >([]);
  const [barangays, setBarangays] = useState<
    { code: string; name: string; city_code: string }[]
  >([]);

  const selectedProvince = watch("province");
  const selectedCity = watch("city");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get("https://psgc.gitlab.io/api/provinces/");
        setProvices(res.data);

        if (type === "update" && address?.province) {
          const provinceData = res.data.find(
            (p: { name: string }) => p.name === address.province
          );
          if (provinceData) {
            setValue("province", provinceData.code);
          }
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };

    fetchProvinces();
  }, [type, address, setValue]);

  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        try {
          const res = await axios.get(
            `https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities/`
          );
          setCities(res.data);
          setValue("barangay", "");
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCities();
    }
  }, [selectedProvince, setValue]);

  useEffect(() => {
    if (selectedCity) {
      const fetchBarangays = async () => {
        try {
          const res = await axios.get(
            `https://psgc.gitlab.io/api/provinces/${selectedProvince}/barangays/`
          );

          setBarangays(res.data);
        } catch (error) {
          console.error("Error fetching barangays:", error);
        }
      };
      fetchBarangays();
    }
  }, [selectedCity, setValue]);

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
    <div className=" p-4 bg-gray-100 text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto items-start"
      >
        {/* Left Section: Delivery, Shipping, Payment */}
        <div className="space-y-6 bg-white p-6 shadow-md rounded-md">
          <h1 className="text-2xl font-bold">
            {type === "create" ? "Create Address" : "Update Address"}
          </h1>
          {/* Delivery Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", { required: true })}
                type="email"
                placeholder="Email"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  {...register("firstName", { required: true })}
                  type="text"
                  placeholder="First name"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  {...register("lastName", { required: true })}
                  type="text"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                {...register("address", { required: true })}
                type="text"
                placeholder="Barangay / Apartment, Suite, etc."
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Label htmlFor="region">State / Province</Label>
                <Controller
                  name="province"
                  control={control}
                  defaultValue={address?.province || ""} // Ensure default value is in Controller
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value); // Update form state
                        setValue("city", ""); // Reset city
                        setValue("barangay", ""); // Reset barangay
                      }}
                      defaultValue={address?.province}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provices.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="city">City</Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value); // Update form state
                          setValue("barangay", ""); // Reset barangay
                        }}
                        defaultValue={address?.city}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="City"
                            defaultValue={address?.city}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.code} value={city.code}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Controller
                    name="barangay"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        defaultValue={address?.barangay}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Barangay" />
                        </SelectTrigger>
                        <SelectContent>
                          {barangays.map((barangay) => (
                            <SelectItem
                              key={barangay.code}
                              value={barangay.code}
                              defaultValue={address?.barangay}
                            >
                              {barangay.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  {...register("postalCode", { required: true })}
                  type="text"
                  placeholder="Postal Code"
                  maxLength={4}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                    +63
                  </span>
                  <Input
                    {...register("phone", { required: true })}
                    type="text"
                    placeholder="Phone"
                    className="pl-12"
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value.startsWith("9")) {
                        e.target.value = "9";
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>{type === "create" ? "Create Address" : "Update Address"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddressPage;
