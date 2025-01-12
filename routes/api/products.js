const router = require("express").Router();

const  prouductController = require("../../controllers/productController");

router.post("/findAllProductsByCatagoryId", async (req, res) => {
  // find all categories including its associated Product
  console.log(req.body)
  const { categoryId } = req.body;
  console.log("catagoryId is :: " + categoryId);
  const data = await prouductController.findAllProductsByCatagoryId(categoryId);
  res.send({ status: "success", data });
});


// Export
module.exports = router;
