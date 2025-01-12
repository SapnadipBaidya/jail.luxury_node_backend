const router = require("express").Router();
const itemsController = require("../../controllers/itemsController");
router.get("/findCatagoryById", async (req, res) => {
  // find all categories including its associated Product
  const { catagoryId } = req.query;
  console.log("catagoryId is :: " + catagoryId);
  const data = await itemsController.findCatagoryById(catagoryId);
  res.send({ status: "success", data });
});

router.get("/getAllCategories", async (req, res) => {
  // find all categories including its associated Product
  const data = await itemsController.getAllCategories();
  res.send({ status: "success", data });
});

// Export
module.exports = router;
