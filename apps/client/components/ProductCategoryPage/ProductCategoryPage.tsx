import { Separator } from "../ui/separator";
import ProductCategoryTable from "./ProductCategoryTable";

const ProductCategoryPage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Product Collections   
        </h1>
        <p className="text-muted-foreground">
          View and manage all product collections in the system.
        </p>
      </div>

      <Separator className="my-6" />
      <ProductCategoryTable />
    </div>
  );
};

export default ProductCategoryPage;
