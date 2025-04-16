export const getCollectionQueryKey = (
  take: number,
  skip: number,
  search: string = "",
  teamId: string = ""
) => ["collections", take, skip, search, teamId] as const;

export const getProductQueryKey = (
  take: number,
  skip: number,
  search: string = "",
  teamId: string = "",
  category: string = ""
) => ["products", take, skip, search, teamId, category] as const;
