const filterService = require("../service/filterService");

async function getSizeFilterByCatagory(catagoryId) {
  return await filterService.getSizeFilterByCatagory(catagoryId);
}

async function getAllColors() {
  return await filterService.getAllColors();
}

module.exports = { getSizeFilterByCatagory, getAllColors };
