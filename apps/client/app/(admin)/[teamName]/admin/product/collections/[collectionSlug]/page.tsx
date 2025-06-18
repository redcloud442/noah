import CollectionSlugPage from "@/components/CollectionSlugPage/CollectionSlugPage";
import { Suspense } from "react";
import LoadingSkeleton from "../../loading";

const CollectionPage = async ({
  params,
}: {
  params: Promise<{ collectionSlug: string; teamName: string }>;
}) => {
  const { collectionSlug } = await params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CollectionSlugPage collectionSlug={collectionSlug} />
    </Suspense>
  );
};

export default CollectionPage;
