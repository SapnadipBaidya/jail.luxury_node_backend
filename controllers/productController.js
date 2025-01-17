const productService = require("../service/productService")

async function findAllProductsByCatagoryId (FilterObj){
 return await  productService.findAllProductsByCategoryId(FilterObj);
}



module.exports = {findAllProductsByCatagoryId};