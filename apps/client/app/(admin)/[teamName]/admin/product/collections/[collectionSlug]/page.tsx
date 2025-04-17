import CollectionSlugPage from "@/components/CollectionSlugPage/CollectionSlugPage";
import { Button } from "@/components/ui/button";
import { findCollectionBySlug, slugify } from "@/utils/function";
import prisma from "@/utils/prisma/prisma";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";
import Link from "next/link";

const CollectionPage = async ({
  params,
}: {
  params: Promise<{ collectionSlug: string; teamName: string }>;
}) => {
  const { collectionSlug, teamName } = await params;
  const generateSlug = slugify(collectionSlug);

  await protectionAdminMiddleware();

  const products = await findCollectionBySlug(generateSlug, prisma, teamName);

  if (!products.length) {
    return (
      <div className="text-center text-gray-500 flex flex-col items-center justify-center gap-4">
        No products found in this collection
        <Link href={`/${teamName}/admin/product/create`}>
          <Button>Create new product</Button>
        </Link>
      </div>
    );
  }

  return (
    <CollectionSlugPage products={products} collectionSlug={collectionSlug} />
  );
};

export default CollectionPage;
