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
import { getCollectionQueryKey } from "@/query/queryKeys";
import { productService } from "@/services/product";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductCategoryForm,
  productCategorySchema,
} from "@packages/shared/src/schema/schema";
import { product_category_table } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  take: number;
  skip: number;
  search?: string;
};

const CreateProductCategoryModal = ({ take, skip, search }: Props) => {
  const [open, setOpen] = useState(false);

  const { userData } = useUserDataStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm<ProductCategoryForm>({
    resolver: zodResolver(productCategorySchema),
    defaultValues: {
      teamId: "",
    },
  });

  useEffect(() => {
    if (userData?.teamMemberProfile?.team_member_team_id) {
      reset({
        teamId: userData.teamMemberProfile.team_member_team_id,
      });
    }
  }, [userData?.teamMemberProfile?.team_member_team_id]);

  const queryKey = getCollectionQueryKey(
    take,
    skip,
    search || "",
    userData?.teamMemberProfile?.team_member_team_id || ""
  );

  const { mutateAsync } = useMutation({
    mutationFn: async (data: ProductCategoryForm) => {
      const productCategory = await productService.createProductCategory(data);
      return productCategory;
    },

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<{
        collections: product_category_table[];
        count: number;
      }>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, {
        collections: [...(previousData?.collections ?? []), newData],
        count: (previousData?.count ?? 0) + 1,
      });

      return { previousData };
    },

    onError: (error: Error, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(error.message);
    },

    onSuccess: () => {
      toast.success("Product category created successfully");
      reset();
      setOpen(false);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const onSubmit = async (data: ProductCategoryForm) => {
    await mutateAsync(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Label htmlFor="name">Product Category Name</Label>
            <Input id="name" {...register("productCategoryName")} />
            {errors.productCategoryName && (
              <p className="text-sm text-red-500">
                {errors.productCategoryName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
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
