"use client";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-input";
import { ProductFormType } from "@/utils/schema";
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
import { MultiSelect } from "../ui/multi-select";

type Props = {
  productIndex: number;
  control: Control<ProductFormType>;
  register: UseFormRegister<ProductFormType>;
  errors: FieldErrors<ProductFormType>;
};

const sizes = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
];

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

      {fields.map((variant, variantIndex) => {
        return (
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

              {/* Color input */}
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
                    errors.products?.[productIndex]?.variants?.[variantIndex]
                      ?.color?.message
                  }
                </p>
              )}

              {/* Multi-size selector */}
              <Controller
                control={control}
                name={`products.${productIndex}.variants.${variantIndex}.sizesWithQuantities`}
                render={({ field }) => {
                  const selected = field.value ?? [];

                  const handleSizeChange = (newSizes: string[]) => {
                    const updated = newSizes.map((size) => {
                      const existing = selected.find((s) => s.size === size);
                      return existing ? existing : { size, quantity: 0 };
                    });
                    field.onChange(updated);
                  };

                  const updateQuantity = (size: string, quantity: number) => {
                    const updated = selected.map((s) =>
                      s.size === size ? { ...s, quantity } : s
                    );
                    field.onChange(updated);
                  };

                  return (
                    <div className="space-y-4">
                      <MultiSelect
                        options={sizes}
                        onValueChange={handleSizeChange}
                        defaultValue={selected.map((s) => s.size)}
                        placeholder="Select sizes"
                        maxCount={6}
                      />

                      {selected.map((s) => (
                        <div key={s.size} className="flex items-center gap-4">
                          <p className="w-12 font-medium">{s.size}</p>
                          <FloatingLabelInput
                            label="Quantity"
                            type="number"
                            value={s.quantity}
                            onChange={(e) =>
                              updateQuantity(s.size, Number(e.target.value))
                            }
                            className="w-28"
                          />
                        </div>
                      ))}
                    </div>
                  );
                }}
              />

              {errors.products?.[productIndex]?.variants?.[variantIndex]
                ?.sizesWithQuantities && (
                <p className="text-red-500 text-sm">
                  {
                    errors.products?.[productIndex]?.variants?.[variantIndex]
                      ?.sizesWithQuantities?.message
                  }
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Variant Button */}
      <div className="flex justify-center">
        <Button
          variant="secondary"
          type="button"
          onClick={() =>
            append({
              id: uuidv4(),
              color: "",
              sizesWithQuantities: [],
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
