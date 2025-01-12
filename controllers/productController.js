const productService = require("../service/productService")

async function findAllProductsByCatagoryId (catagoryId){
 return await  productService.findAllProductsByCatagoryId(catagoryId);
}



module.exports = {findAllProductsByCatagoryId};