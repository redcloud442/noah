"use client";

import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-input";
import { ProductFormType } from "@/utils/schema";
import { PlusCircle, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Control,
  Controller,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
  useWatch,
} from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { MultiSelect } from "../ui/multi-select";
import { VariantImageEditDropzone } from "./VariantImageEditDropzone";

const sizes = [
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
];

type Props = {
  productIndex: number;
  control: Control<ProductFormType>;
  register: UseFormRegister<ProductFormType>;
  errors: FieldErrors<ProductFormType>;
};

export const ProductVariantsEdit = ({
  productIndex,
  control,
  register,
  errors,
}: Props) => {
  const { fields, append, update } = useFieldArray({
    control,
    name: `products.${productIndex}.variants`,
  });

  const watchedVariants = useWatch({
    control,
    name: `products.${productIndex}.variants`,
  });

  const [imagePreviews, setImagePreviews] = useState<string[][]>(
    fields.map((field) => {
      const imageFiles = field.images as File[];
      if (imageFiles.length > 0) {
        return imageFiles.map((file) => URL.createObjectURL(file));
      }
      return (field.publicUrl as string[]) ?? [];
    })
  );
  const [newPreview, setNewPreview] = useState<string[][]>(
    fields.map((field) => {
      const imageFiles = field.images as File[];

      return imageFiles.map((file) => URL.createObjectURL(file));
    })
  );
  const [editingIndex, setEditingIndex] = useState<string | null>(null);

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
    update(variantIndex, {
      ...watchedVariants?.[variantIndex], // Not `fields[variantIndex]`
      isDeleted: true,
    });
  };

  return (
    <div className="p-2 space-y-8">
      <h3 className="font-medium">Product Variants</h3>

      {fields.map((field, variantIndex) => {
        const variant = watchedVariants?.[variantIndex];
        if (variant?.isDeleted) return null;

        return (
          <div
            key={field.id}
            className="border p-4 rounded-md flex flex-col-reverse md:flex-row gap-6 w-full"
          >
            <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
              {editingIndex === field.id ? (
                <Controller
                  control={control}
                  name={`products.${productIndex}.variants.${variantIndex}.images`}
                  render={({ field }) => (
                    <VariantImageEditDropzone
                      previewUrls={newPreview[variantIndex] || []}
                      onDropImages={(files: File[]) => {
                        field.onChange(files);
                        const newPreviews = files.map((file) =>
                          URL.createObjectURL(file)
                        );
                        setNewPreview((prev) => {
                          const updated = [...prev];
                          updated[variantIndex] = newPreviews;
                          return updated;
                        });
                      }}
                    />
                  )}
                />
              ) : (
                <div className="relative group flex flex-wrap gap-2 justify-start">
                  {imagePreviews[variantIndex]?.length > 0 ? (
                    imagePreviews[variantIndex].map((url, i) => (
                      <Image
                        key={i}
                        src={url}
                        alt={`Preview ${i + 1}`}
                        width={200}
                        height={200}
                        className=" object-cover rounded border"
                      />
                    ))
                  ) : (
                    <Image
                      src="/placeholder.png"
                      alt="Placeholder"
                      width={200}
                      height={200}
                      className="object-cover rounded border"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingIndex(field.id)}
                    className="absolute inset-0 bg-black/50 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Do you want to edit this picture?
                  </button>
                </div>
              )}
            </div>

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
                    errors.products?.[productIndex]?.variants?.[variantIndex]
                      ?.color?.message
                  }
                </p>
              )}

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
              isDeleted: false,
            })
          }
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add Variant
        </Button>
      </div>
    </div>
  );
};
