
import * as filterService from "../service/filterService.js";

export async function getSizeFilterByCatagory(catagoryId) {
  return await filterService.getSizeFilterByCatagory(catagoryId);
}

export async function getAllColors() {
  return await filterService.getAllColors();
}


