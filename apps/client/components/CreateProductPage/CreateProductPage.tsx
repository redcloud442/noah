"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useUserDataStore from "@/lib/userDataStore";
import { formattedCreateProductResponse } from "@/utils/function";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";

import { productService } from "@/services/product";
import { ProductFormType, productSchema } from "@/utils/schema";
import { product_category_table } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PhilippinePeso, PlusCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ImageDropzone } from "../ProductCategoryPage/CreateProductCategory/ImageDropzone";
import { FloatingLabelInput } from "../ui/floating-input";
import { Label } from "../ui/label";
import { ProductVariants } from "./ProductVariants";

const CreateProductPage = () => {
  const supabaseClient = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { userData } = useUserDataStore();
  const [sizeGuidePreviewUrls, setSizeGuidePreviewUrls] = useState<
    Record<number, string>
  >({});

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      products: [
        {
          name: "",
          price: 0,
          description: "",
          category: "",
          sizeGuide: new File([], ""),
          sizeGuideUrl: "",
          variants: [
            {
              id: uuidv4(),
              color: "",
              sizesWithQuantities: [],
              images: [],
            },
          ],
        },
      ],
    },
  });

  const {
    fields: productFields,
    append: addProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: "products",
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getProductCategories(),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
  });

  const onSubmit = async (data: ProductFormType) => {
    try {
      const { formattedProducts } = await formattedCreateProductResponse(
        data,
        supabaseClient,
        userData?.teamMemberProfile.team_member_team_id || ""
      );

      await productService.createProduct(formattedProducts);

      toast.success("Product created successfully");

      queryClient.invalidateQueries({ queryKey: ["product"] });
      router.push(
        `/${userData?.teamMemberProfile.team_member_team.toLocaleLowerCase()}/admin/product`
      );
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error creating product");
      }
    }
  };

  const handleAddProduct = () => {
    addProduct({
      name: "",
      price: 0,
      description: "",
      category: "",
      sizeGuide: new File([], ""),
      sizeGuideUrl: "",
      variants: [
        {
          id: uuidv4(),
          color: "",
          sizesWithQuantities: [],
          images: [],
        },
      ],
    });
  };

  return (
    <div className="p-6 rounded-lg shadow-md dark:bg-zinc-900 mx-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Create Product
        </h1>
        <p className="text-muted-foreground">
          Create a new product and variants.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {productFields.map((product, productIndex) => {
          return (
            <div key={product.id} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-medium">
                  Product # {productIndex + 1}
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

              {errors.products?.[productIndex]?.name && (
                <p className="text-red-500 text-sm">
                  {errors.products[productIndex]?.name?.message}
                </p>
              )}

              <Controller
                control={control}
                name={`products.${productIndex}.category`}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} {...field}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Collections" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.map(
                        (category: product_category_table) => (
                          <SelectItem
                            key={category.product_category_id}
                            value={category.product_category_id}
                          >
                            {category.product_category_name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.products?.[productIndex]?.category && (
                <p className="text-red-500 text-sm">
                  {errors.products[productIndex]?.category?.message}
                </p>
              )}
              <div className="space-y-2">
                <Label>Size Guide Image</Label>
                <Controller
                  control={control}
                  name={`products.${productIndex}.sizeGuide`}
                  render={({ field }) => (
                    <ImageDropzone
                      onDropImages={(file) => {
                        field.onChange(file);
                        setSizeGuidePreviewUrls((prev) => ({
                          ...prev,
                          [productIndex]: URL.createObjectURL(file),
                        }));
                      }}
                      previewUrl={sizeGuidePreviewUrls[productIndex] || ""}
                    />
                  )}
                />
              </div>
              <div className="p-2 space-y-8">
                <ProductVariants
                  key={product.id}
                  productIndex={productIndex}
                  control={control}
                  register={register}
                  errors={errors}
                />
              </div>
            </div>
          );
        })}

        <div className="flex justify-center">
          <Button
            variant="secondary"
            type="button"
            className="w-full"
            onClick={handleAddProduct}
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          disabled={productFields.length === 0 || isSubmitting}
          type="submit"
          className="w-full bg-blue-500 text-white mt-6"
        >
          Submit Products
        </Button>
      </form>
    </div>
  );
};

export default CreateProductPage;
