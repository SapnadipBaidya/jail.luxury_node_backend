import * as paymentsService from "../service/paymentsService.js";

export async function checkout({gender,userId=null}) {
  return await paymentsService.checkout();
}

export async function verification(FilterObj) {
  return await paymentsService.verification();
}



