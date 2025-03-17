"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { FloatingLabelInput } from "../ui/floating-input";
import { Textarea } from "../ui/textarea";

const productSchema = z.object({
  products: z.array(
    z.object({
      name: z.string().min(1, "Product name is required"),
      price: z.coerce.number().min(1, "Price must be greater than 0"),
      description: z.string().optional(),
      category: z.string().min(1, "Category is required"),
      variants: z.array(
        z.object({
          id: z.string().uuid("ID must be a valid UUID"),
          color: z.string().min(1, "Color is required"),
          size: z.string().min(1, "Size is required"),
          quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
        })
      ),
    })
  ),
});

type ProductFormType = z.infer<typeof productSchema>;

const CreateProductPage = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      products: [
        {
          name: "",
          price: 0,
          description: "",
          category: "",
          variants: [{ id: uuidv4(), color: "", size: "", quantity: 0 }],
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

  const variantFieldArrays = productFields.map((_, productIndex) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useFieldArray({
      control,
      name: `products.${productIndex}.variants`,
    })
  );

  useEffect(() => {
    setCategories([
      { id: "electronics", name: "Electronics" },
      { id: "fashion", name: "Fashion" },
      { id: "books", name: "Books" },
    ]);
  }, []);

  const onSubmit = (data: ProductFormType) => {
    console.log("Submitted Products:", data);
  };

  const handleAddMoreVariants = (productIndex: number) => {
    variantFieldArrays[productIndex].append({
      id: uuidv4(),
      color: "",
      size: "",
      quantity: 0,
    });
  };

  const handleRemoveVariant = (productIndex: number, variantIndex: number) => {
    variantFieldArrays[productIndex].remove(variantIndex);
  };

  const handleAddProduct = () => {
    addProduct({
      name: "",
      price: 0,
      description: "",
      category: "",
      variants: [{ id: uuidv4(), color: "", size: "", quantity: 0 }],
    });
  };

  return (
    <div className="p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Products</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {productFields.map((product, productIndex) => {
          const variantFieldArray = variantFieldArrays[productIndex];
          return (
            <div key={product.id} className="border p-4 rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-medium">
                  Product {productIndex + 1}
                </h1>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => removeProduct(productIndex)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
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

              <Textarea
                placeholder="Description"
                {...register(`products.${productIndex}.description`)}
              />

              {/* Product Category */}
              <Select {...register(`products.${productIndex}.category`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.products?.[productIndex]?.category && (
                <p className="text-red-500 text-sm">
                  {errors.products[productIndex]?.category?.message}
                </p>
              )}

              <div className="p-2 space-y-8">
                <h3 className="font-medium">Product Variants</h3>

                {variantFieldArray.fields.map((variant, variantIndex) => (
                  <div
                    key={variant.id}
                    className="border p-4 rounded-md space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h1>Product Variant #{variantIndex + 1}</h1>
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() =>
                          handleRemoveVariant(productIndex, variantIndex)
                        }
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
                          errors.products[productIndex]?.variants?.[
                            variantIndex
                          ]?.color?.message
                        }
                      </p>
                    )}

                    <Select
                      {...register(
                        `products.${productIndex}.variants.${variantIndex}.size`
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="S">S</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="XL">XL</SelectItem>
                        <SelectItem value="XXL">XXL</SelectItem>
                      </SelectContent>
                    </Select>

                    {errors.products?.[productIndex]?.variants?.[variantIndex]
                      ?.size && (
                      <p className="text-red-500 text-sm">
                        {
                          errors.products[productIndex]?.variants?.[
                            variantIndex
                          ]?.size?.message
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
                          errors.products[productIndex]?.variants?.[
                            variantIndex
                          ]?.quantity?.message
                        }
                      </p>
                    )}
                  </div>
                ))}

                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => handleAddMoreVariants(productIndex)}
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Variant
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-center">
          <Button variant="secondary" type="button" onClick={handleAddProduct}>
            <PlusCircle className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-blue-500 text-white mt-6">
          Submit Products
        </Button>
      </form>
    </div>
  );
};

export default CreateProductPage;
