"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import useUserDataStore from "@/lib/userDataStore";
import { productService } from "@/services/product";
import { formattedUpdateProductResponse } from "@/utils/function";
import { ProductFormType, productSchema } from "@/utils/schema";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { product_category_table } from "@prisma/client";
import { PhilippinePeso, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FloatingLabelInput } from "../ui/floating-input";
import { ProductVariantsEdit } from "./ProductVariantsEdit";

type EditProductPageProps = {
  formattedVariantInfo: ProductFormType;
  productId: string;
};

const EditProductPage = ({
  formattedVariantInfo,
  productId,
}: EditProductPageProps) => {
  const supabaseClient = createClient();
  const router = useRouter();

  const { userData } = useUserDataStore();
  const [categories, setCategories] = useState<product_category_table[]>([]);

  const {
    control,
    handleSubmit,
    register,

    formState: { errors, isSubmitting },
  } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: formattedVariantInfo,
  });

  const { fields: productFields, remove: removeProduct } = useFieldArray({
    control,
    name: "products",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabaseClient
          .schema("product_schema")
          .from("product_category_table")
          .select("*");

        if (error) {
          toast.error(error.message);
        }

        setCategories(data || []);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error fetching categories");
        }
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data: ProductFormType) => {
    try {
      const { formattedProducts } = await formattedUpdateProductResponse(
        data,
        supabaseClient,
        userData?.teamMemberProfile.team_member_team_id || "",
        productId
      );

      await productService.updateProduct(formattedProducts);

      toast.success("Product updated successfully");
      router.push(
        `/${userData?.teamMemberProfile.team_member_team.toLowerCase()}/admin/product`
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error updating product");
      }
    }
  };

  return (
    <div className="p-6 rounded-lg shadow-md bg-white dark:bg-zinc-900 mx-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Edit Product
        </h1>
        <p className="text-muted-foreground">
          Edit the product details and variants.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {productFields.map((product, productIndex) => (
          <div
            key={product.id}
            className="border p-4 rounded-md space-y-6 border-zinc-200 dark:border-zinc-700"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-medium text-zinc-700 dark:text-white">
                Product #{productIndex + 1}
              </h1>
              {productFields.length > 1 && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => removeProduct(productIndex)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Separator />

            <FloatingLabelInput
              label="Product Name"
              {...register(`products.${productIndex}.name`)}
            />
            {errors.products?.[productIndex]?.name && (
              <p className="text-red-500 text-sm">
                {errors.products[productIndex]?.name?.message}
              </p>
            )}

            <FloatingLabelInput
              label="Product Description"
              {...register(`products.${productIndex}.description`)}
            />

            <FloatingLabelInput
              label="Product Price"
              type="number"
              leftIcon={<PhilippinePeso size={14} />}
              {...register(`products.${productIndex}.price`)}
            />

            <Controller
              control={control}
              name={`products.${productIndex}.category`}
              render={({ field }) => (
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.product_category_id}
                        value={category.product_category_id}
                      >
                        {category.product_category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.products?.[productIndex]?.category && (
              <p className="text-red-500 text-sm">
                {errors.products[productIndex]?.category?.message}
              </p>
            )}

            <div className="p-2 space-y-8">
              <ProductVariantsEdit
                key={product.id}
                productIndex={productIndex}
                control={control}
                register={register}
                errors={errors}
              />
            </div>
          </div>
        ))}

        <Button
          disabled={productFields.length === 0 || isSubmitting}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default EditProductPage;
