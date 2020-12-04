/**
 * map object keys to lowercase, used for ex to convert header keys to lowercase
 * @param obj
 */
export const mapKeysToLowerCase = (obj: object) => {
  const keys: string[] = Object.keys(obj);
  // initialize result
  const result: { [key: string]: string; } = {};
  keys.forEach((e) => {
    result[e.toLowerCase()] = obj[e];
  });

  return result;
};

/**
 * paginator helper function
 * @param items array of items
 * @param currentPage
 * @param perPageItems
 * @description used like `console.log(paginator(products, 2, 2));`
 */
export const paginator = (items: any, currentPage: number, perPageItems: number) => {
  // defaults
  const page = currentPage || 1;
  const perPage = perPageItems || 10;
  const offset = (page - 1) * perPage;

  const paginatedItems = items.slice(offset).slice(0, perPageItems);
  const totalPages = Math.ceil(items.length / perPage);

  return {
    page,
    perPage,
    prePage: page - 1 ? page - 1 : null,
    nextPage: (totalPages > page) ? page + 1 : null,
    total: items.length,
    totalPages,
    data: paginatedItems,
  };
};