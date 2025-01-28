import * as cartService from "../service/cartService.js";

export async function addOrEditCart (FilterObj){
    console.log("FilterObj",FilterObj)
 return await  cartService.addOrEditCart(FilterObj);
}

export async function fetchUserCart (FilterObj){
    return await  cartService.fetchUserCart(FilterObj);
   }
export async function  deleteFromUserCart(FilterObj){
    return await  cartService.deleteFromUserCart(FilterObj);
}

