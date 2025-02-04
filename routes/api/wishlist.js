import express from "express";
const router = express.Router();


import * as wishlistController from "../../controllers/wishlistController.js";
import { verifyToken } from "../../utils/verifyToken.js";


router.post("/addOrEditWishlist",verifyToken, async (req, res) => {
  console.log("req.user_id",req.user)
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
export default router;
