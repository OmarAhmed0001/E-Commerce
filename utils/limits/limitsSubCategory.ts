interface SubCategoryLimit {
  subcategory: {
    limit: number;
  };
}

const subcategory: SubCategoryLimit = {
  subcategory: { limit: 10 },
};

export const limitedForSubCategory = (): number => {
  return subcategory.subcategory.limit;
};
