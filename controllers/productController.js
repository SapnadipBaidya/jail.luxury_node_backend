const productService = require("../service/productService")

async function findAllProductsByCatagoryId (FilterObj){
 return await  productService.findAllProductsByCategoryId(FilterObj);
}

async function findProductsByPdId (FilterObj){
    return await  productService.findProductsByPdId(FilterObj);
   }
   

module.exports = {findAllProductsByCatagoryId,findProductsByPdId};