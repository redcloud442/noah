import CollectionSlugPage from "@/components/CollectionSlugPage/CollectionSlugPage";
import { findCollectionBySlug, slugify } from "@/utils/function";
import prisma from "@/utils/prisma/prisma";

const CollectionPage = async ({
  params,
}: {
  params: Promise<{ collectionSlug: string }>;
}) => {
  const { collectionSlug } = await params;
  const generateSlug = slugify(collectionSlug);
  const products = await findCollectionBySlug(generateSlug, prisma);

  if (!products.length) {
    return (
      <div className="text-center text-gray-500">
        No products found in this collection
      </div>
    );
  }

  return (
    <CollectionSlugPage products={products} collectionSlug={collectionSlug} />
  );
};

export default CollectionPage;
