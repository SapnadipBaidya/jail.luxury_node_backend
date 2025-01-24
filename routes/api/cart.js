const router = require("express").Router();

const  cartController = require("../../controllers/cartController");

router.post("/addOrEditCart", async (req, res) => {
    console.log(req.body)
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    const data = await cartController.addOrEditCart(payloadObj);
    res.send({ status: "success", data });
  
});

router.post("/fetchUserCart", async (req, res) => {
   // find all categories including its associated Product
  console.log(req.body)
  const { payloadObj } = req.body;
  console.log("payloadObj is :: " + payloadObj);
  const data = await cartController.fetchUserCart(payloadObj);
  res.send({ status: "success", data });
});

router.post("/deleteFromUserCart", async (req, res) => {
    // find all categories including its associated Product
    console.log(req.body)
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    const data = await cartController.deleteFromUserCart(payloadObj);
    res.send({ status: "success", data });
  });
  

// Export
module.exports = router;
