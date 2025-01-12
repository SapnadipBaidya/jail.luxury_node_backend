const itemsService = require("../service/itemsService")

async function findCatagoryById (catagoryId){
 return await  itemsService.findCatagoryById(catagoryId);
}

async function getAllCategories (){
     return  await itemsService.getAllCategories();
}


module.exports = {findCatagoryById,getAllCategories};