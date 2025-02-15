import * as paymentsService from "../service/paymentsService.js";

export async function checkout(filterObj) {
  return await paymentsService.itemsCheckout(filterObj); 
}

export async function verification(FilterObj) {
  return await paymentsService.paymentVerification();
}



