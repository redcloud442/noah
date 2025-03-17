import ProductCategoryTable from "./ProductCategoryTable";

type ProductCategoryPageProps = {
  collections: {
    product_category_id: string;
    product_category_name: string;
    product_category_description: string;
  }[];
};

const ProductCategoryPage = ({
  collections: initialData,
}: ProductCategoryPageProps) => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold mb-6">Product Categories</h1>

      <ProductCategoryTable initialData={initialData} />
    </div>
  );
};

export default ProductCategoryPage;
