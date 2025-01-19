const wishlistService = require("../service/wishlistService")

async function addOrEditWishlist (FilterObj){
 return await  wishlistService.addOrEditWishlist(FilterObj);
}

async function fetchUserWishlist (FilterObj){
    return await  wishlistService.fetchUserWishlist(FilterObj);
   }
   

module.exports = {addOrEditWishlist,fetchUserWishlist};