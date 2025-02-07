import express from "express";
const router = express.Router();

import * as cartController from "../../controllers/cartController.js";
import { verifyToken } from "../../utils/verifyToken.js";

router.post("/addOrEditCart",verifyToken, async (req, res) => {
    console.log("req.user_id",req.user,req.body)
    console.log(req.body);
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    payloadObj.userId =  req.user.user_id;
    const data = await cartController.addOrEditCart(payloadObj);
    res.send({ status: "success", data });
});

router.post("/fetchUserCart", async (req, res) => {
    // find all categories including its associated Product
    console.log(req.body);
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    const data = await cartController.fetchUserCart(payloadObj);
    res.send({ status: "success", data });
});

router.post("/deleteFromUserCart", async (req, res) => {
    // find all categories including its associated Product
    console.log(req.body);
    const { payloadObj } = req.body;
    console.log("payloadObj is :: " + payloadObj);
    const data = await cartController.deleteFromUserCart(payloadObj);
    res.send({ status: "success", data });
});

// Export
export default router;