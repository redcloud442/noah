import { ProductType } from "@/utils/types";
import { HoverVariantCard } from "../CollectionNamePage/CollectionNamePage";

type Variant = {
  variants: ProductType[];
};

const ModelSection = ({ variants }: Variant) => {
  return (
    <div className="flex flex-wrap justify-center items-center w-full bg-white gap-4 p-4">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {variants.map((item) =>
          item.product_variants.map((variant) => (
            <HoverVariantCard
              key={variant.product_variant_id}
              variant={variant}
              product={item}
              currentDate={new Date()}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ModelSection;
