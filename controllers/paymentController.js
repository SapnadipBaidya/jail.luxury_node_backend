import * as paymentsService from "../service/paymentsService.js";

export async function checkout(obj) {
    console.log("checkout obj",obj)
    const checkoutData = await paymentsService.itemsCheckout(obj); 
    console.log("checkoutData",checkoutData)
  return checkoutData
}

export async function verification(FilterObj) {
  return await paymentsService.paymentVerification();
}



