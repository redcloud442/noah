"use client";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductFormType } from "@packages/shared/src/schema/schema";
import { PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { VariantImageDropzone } from "../ProductCategoryPage/VariantImageDropzone";

type Props = {
  productIndex: number;
  control: Control<ProductFormType>;
  register: UseFormRegister<ProductFormType>;
  errors: FieldErrors<ProductFormType>;
};

export const ProductVariants = ({
  productIndex,
  control,
  register,
  errors,
}: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `products.${productIndex}.variants`,
  });
  const [imagePreviews, setImagePreviews] = useState<string[][]>([]);

  useEffect(() => {
    setImagePreviews((prev) => {
      const updated = [...prev];
      while (updated.length < fields.length) {
        updated.push([]);
      }
      return updated;
    });
  }, [fields.length]);

  const handleVariantDelete = (variantIndex: number) => {
    remove(variantIndex);
    setImagePreviews((prev) => {
      const updated = [...prev];
      updated.splice(variantIndex, 1);
      return updated;
    });
  };
  return (
    <div className="p-2 space-y-8">
      <h3 className="font-medium">Product Variants</h3>

      {fields.map((variant, variantIndex) => (
        <div
          key={variant.id}
          className="border p-4 rounded-md flex flex-col-reverse md:flex-row gap-6 w-full"
        >
          {/* Left: Image Upload Area */}
          <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
            <Controller
              control={control}
              name={`products.${productIndex}.variants.${variantIndex}.images`}
              render={({ field }) => (
                <VariantImageDropzone
                  previewUrls={imagePreviews[variantIndex] || []}
                  onDropImages={(files) => {
                    field.onChange(files);
                    const newPreviews = files.map((file) =>
                      URL.createObjectURL(file)
                    );

                    setImagePreviews((prev) => {
                      const updated = [...prev];
                      updated[variantIndex] = [
                        ...(updated[variantIndex] || []),
                        ...newPreviews,
                      ];
                      return updated;
                    });
                  }}
                />
              )}
            />
          </div>

          {/* Right: Form Fields */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-medium">
                Product Variant #{variantIndex + 1}
              </h1>
              <Button
                variant="destructive"
                type="button"
                onClick={() => handleVariantDelete(variantIndex)}
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>

            <FloatingLabelInput
              label="Color"
              {...register(
                `products.${productIndex}.variants.${variantIndex}.color`
              )}
            />
            {errors.products?.[productIndex]?.variants?.[variantIndex]
              ?.color && (
              <p className="text-red-500 text-sm">
                {
                  errors.products[productIndex]?.variants?.[variantIndex]?.color
                    ?.message
                }
              </p>
            )}

            <Controller
              control={control}
              name={`products.${productIndex}.variants.${variantIndex}.size`}
              render={({ field }) => (
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {["S", "M", "L", "XL", "XXL"].map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.products?.[productIndex]?.variants?.[variantIndex]
              ?.size && (
              <p className="text-red-500 text-sm">
                {
                  errors.products[productIndex]?.variants?.[variantIndex]?.size
                    ?.message
                }
              </p>
            )}

            <FloatingLabelInput
              label="Quantity"
              type="number"
              {...register(
                `products.${productIndex}.variants.${variantIndex}.quantity`
              )}
            />
            {errors.products?.[productIndex]?.variants?.[variantIndex]
              ?.quantity && (
              <p className="text-red-500 text-sm">
                {
                  errors.products[productIndex]?.variants?.[variantIndex]
                    ?.quantity?.message
                }
              </p>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-center">
        <Button
          variant="secondary"
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              color: "",
              size: "",
              quantity: 0,
              images: [],
            })
          }
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add Variant
        </Button>
      </div>
    </div>
  );
};
