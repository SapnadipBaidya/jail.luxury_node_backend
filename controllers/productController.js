const productService = require("../service/productService");

async function findAllProductsByCatagoryId(FilterObj) {
  return await productService.findAllProductsByCatagoryId(FilterObj);
}

async function findProductsByPdId(FilterObj) {
    return await productService.findProductsByPdId(FilterObj);
}

async function findAllProductsByCatagoryId(FilterObj){
    return await productService.findAllProductsByCatagoryId(FilterObj);
}

async function findAllAvalibaleSizesByPidAndColorId(FilterObj){
    return await productService.findAllAvalibaleSizesByPidAndColorId(FilterObj);
}

async function findAllAvalibaleColorsByPidAndSizeId(FilterObj){
    return await productService.findAllAvalibaleColorsByPidAndSizeId(FilterObj);
}
module.exports = { findAllProductsByCatagoryId, findProductsByPdId ,findAllAvalibaleColorsByPidAndSizeId , findAllAvalibaleSizesByPidAndColorId};
