const router = require("express").Router();

const  wishlistController = require("../../controllers/wishlistController");

router.post("/addOrEditWishlist", async (req, res) => {
    console.log(req.body)
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    const data = await wishlistController.addOrEditWishlist(payloadObj);
    res.send({ status: "success", data });
  
});

router.post("/fetchUserWishlist", async (req, res) => {
  // find all categories including its associated Product
  console.log(req.body)
  const { payloadObj } = req.body;
  console.log("payloadObj is :: " + payloadObj);
  const data = await wishlistController.fetchUserWishlist(payloadObj);
  res.send({ status: "success", data });
});

router.post("/deleteFromUserWishlist", async (req, res) => {
    // find all categories including its associated Product
    console.log(req.body)
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    const data = await wishlistController.deleteFromUserWishlist(payloadObj);
    res.send({ status: "success", data });
  });
  


// Export
module.exports = router;
