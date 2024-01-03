interface ProductLimit {
  product: {
    limit: number;
  };
}

const product: ProductLimit = {
  product: { limit: 7000 },
};

export const limitedForProduct = (): number => {
  return product.product.limit;
};
