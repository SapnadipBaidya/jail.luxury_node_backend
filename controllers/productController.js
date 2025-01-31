import * as productService from "../service/productService.js";
export async function findAllProductsByCatagoryId(FilterObj) {
  return await productService.findAllProductsByCatagoryId(FilterObj);
}

export async function findProductsByPdId(FilterObj) {
  return await productService.findProductsByPdId(FilterObj);
}

export async function findProductsByCategoryName({
    categoryName,
    colorFilter = null,
    sizeFilter = null,
    sortBy = "updated_at",
    sortOrder = "DESC",
    page = null,
    limit = null,
    userId = null,
    gender = null
  }) {
    return await productService.findProductsByCategoryName({
      categoryName,
      colorFilter: colorFilter || null,
      sizeFilter: sizeFilter || null,
      sortBy: sortBy || null,
      sortOrder: sortOrder || null,
      page: page || null,
      limit: limit || null,
      userId: userId || null,
      gender: gender || null
    });
  }
  

export async function findAllAvalibaleSizesByPidAndColorId(FilterObj) {
  return await productService.findAllAvalibaleSizesByPidAndColorId(FilterObj);
}

export async function findAllAvalibaleColorsByPidAndSizeId(FilterObj) {
  return await productService.findAllAvalibaleColorsByPidAndSizeId(FilterObj);
}
