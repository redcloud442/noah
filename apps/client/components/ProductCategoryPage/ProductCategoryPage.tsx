import ProductCategoryTable from "./ProductCategoryTable";

const ProductCategoryPage = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold mb-6">Product Categories</h1>

      <ProductCategoryTable />
    </div>
  );
};

export default ProductCategoryPage;
