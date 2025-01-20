const wishlistService = require("../service/wishlistService")

async function addOrEditWishlist (FilterObj){
    console.log("FilterObj",FilterObj)
 return await  wishlistService.addOrEditWishlist(FilterObj);
}

async function fetchUserWishlist (FilterObj){
    return await  wishlistService.fetchUserWishlist(FilterObj);
   }
async function  deleteFromUserWishlist(FilterObj){
    return await  wishlistService.deleteFromUserWishlist(FilterObj);
}

module.exports = {addOrEditWishlist,fetchUserWishlist,deleteFromUserWishlist};