
import * as productService from "../service/productService.js";
export async function findAllProductsByCatagoryId(FilterObj) {
  return await productService.findAllProductsByCatagoryId(FilterObj);
}

export async function findProductsByPdId(FilterObj) {
    return await productService.findProductsByPdId(FilterObj);
}


export async function findAllAvalibaleSizesByPidAndColorId(FilterObj){
    return await productService.findAllAvalibaleSizesByPidAndColorId(FilterObj);
}

export async function findAllAvalibaleColorsByPidAndSizeId(FilterObj){
    return await productService.findAllAvalibaleColorsByPidAndSizeId(FilterObj);
}

