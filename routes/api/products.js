const router = require("express").Router();

const  prouductController = require("../../controllers/productController");

router.post("/findAllProductsByCatagoryId", async (req, res) => {
  // find all categories including its associated Product
  console.log(req.body)
  const { payloadObj } = req.body;
  console.log("payloadObj is :: " + payloadObj);
  const data = await prouductController.findAllProductsByCatagoryId(payloadObj);
  res.send({ status: "success", data });
});

router.post("/findProductsByPdId", async (req, res) => {
  // find all categories including its associated Product
  console.log(req.body)
  const { payloadObj } = req.body;
  console.log("payloadObj is :: " + payloadObj);
  const responseData = await prouductController.findProductsByPdId(payloadObj);
  res.send({ status: "success", responseData });
});

router.post("/findAllAvalibaleColorsByPidAndSizeId", async (req, res) => {
  // find all categories including its associated Product
  console.log(req.body)
  const { payloadObj } = req.body;
  console.log("payloadObj is :: " + payloadObj);
  const responseData = await prouductController.findAllAvalibaleColorsByPidAndSizeId(payloadObj);
  res.send({ status: "success", responseData });
});

router.post("/findAllAvalibaleSizesByPidAndColorId", async (req, res) => {
  // find all categories including its associated Product
  console.log(req.body)
  const { payloadObj } = req.body;
  console.log("payloadObj is :: " + payloadObj);
  const responseData = await prouductController.findAllAvalibaleSizesByPidAndColorId(payloadObj);
  res.send({ status: "success", responseData });
});
// Export
module.exports = router;
