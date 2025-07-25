"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useUserDataStore from "@/lib/userDataStore";
import { productService } from "@/services/product";
import { ProductCategoryForm, productCategorySchema } from "@/utils/schema";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { product_category_table } from "@prisma/client";
import { PlusIcon } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ImageDropzone } from "./ImageDropzone";

type Props = {
  setCollections: Dispatch<
    SetStateAction<{
      collections: product_category_table[];
      count: number;
    } | null>
  >;
};

const CreateProductCategoryModal = ({ setCollections }: Props) => {
  const [open, setOpen] = useState(false);

  const { userData } = useUserDataStore();

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductCategoryForm>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      teamId: "",
    },
  });

  const image = watch("image");

  useEffect(() => {
    if (userData?.teamMemberProfile?.team_member_team_id) {
      reset({
        teamId: userData.teamMemberProfile.team_member_team_id,
      });
    }
  }, [userData?.teamMemberProfile?.team_member_team_id]);

  const handleCreateProductCategory = async (
    data: ProductCategoryForm & { imageUrl: string }
  ) => {
    try {
      const productCategory = await productService.createProductCategory(data);
      setCollections((prev) => ({
        ...prev,
        collections: [...(prev?.collections ?? []), productCategory],
        count: (prev?.count ?? 0) + 1,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: ProductCategoryForm) => {
    const file = data.image as File;
    let imageUrl = "";
    if (file) {
      const filePath = `uploads/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("PRODUCT_IMAGE")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const publicUrl = `https://umypvsozlsjtjfsakqxg.supabase.co/storage/v1/object/public/PRODUCT_IMAGE/${filePath}`;

      imageUrl = publicUrl;
    }

    await handleCreateProductCategory({ ...data, imageUrl });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary">
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Product Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product Category</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new product category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-white">
              Product Category Name
            </Label>
            <Input id="name" {...register("productCategoryName")} />
            {errors.productCategoryName && (
              <p className="text-sm text-red-500">
                {errors.productCategoryName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("productCategoryDescription")}
            />
            {errors.productCategoryDescription && (
              <p className="text-sm text-red-500">
                {errors.productCategoryDescription.message}
              </p>
            )}
          </div>

          <div>
            <Controller
              control={control}
              name={`image`}
              render={({ field }) => (
                <ImageDropzone
                  onDropImages={(files) => {
                    field.onChange(files);
                  }}
                />
              )}
            />
            {image && (
              <p className="text-sm text-center text-green-500">
                File Uploaded Successfully
              </p>
            )}
            {errors.image && (
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductCategoryModal;
