const router = require("express").Router();

const filterController = require("../../controllers/filterController");
router.post("/getSizeFilterByCatagory", async (req, res) => {
  // find all categories including its associated Product
  const { categoryId } = req.body;
  console.log("categoryId is :: " + categoryId);
  const data = await filterController.getSizeFilterByCatagory(categoryId);
  res.send({ status: "success", data });
});

router.get("/getAllColors", async (req, res) => {
  // find all categories including its associated Product
  const data = await filterController.getAllColors();
  res.send({ status: "success", data });
});

// Export
module.exports = router;
