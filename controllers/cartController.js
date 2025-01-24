const cartService = require("../service/cartService")

async function addOrEditCart (FilterObj){
    console.log("FilterObj",FilterObj)
 return await  cartService.addOrEditCart(FilterObj);
}

async function fetchUserCart (FilterObj){
    return await  cartService.fetchUserCart(FilterObj);
   }
async function  deleteFromUserCart(FilterObj){
    return await  cartService.deleteFromUserCart(FilterObj);
}

module.exports = {addOrEditCart,fetchUserCart,deleteFromUserCart};