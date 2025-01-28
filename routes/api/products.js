import { Router } from "express";
import * as productController from "../../controllers/productController.js";
import * as searchController from "../../controllers/searchController.js";

const router = Router();

router.post("/findAllProductsByCatagoryId", async (req, res) => {
  console.log(req.body);
  const { payloadObj } = req.body;
  console.log("payloadObj is ::", payloadObj);
  const data = await productController.findAllProductsByCatagoryId(payloadObj);
  res.send({ status: "success", data });
});

router.post("/findProductsByPdId", async (req, res) => {
  console.log(req.body);
  const { payloadObj } = req.body;
  console.log("payloadObj is ::", payloadObj);
  const responseData = await productController.findProductsByPdId(payloadObj);
  res.send({ status: "success", responseData });
});

router.post("/findAllAvalibaleColorsByPidAndSizeId", async (req, res) => {
  console.log(req.body);
  const { payloadObj } = req.body;
  console.log("payloadObj is ::", payloadObj);
  const responseData = await productController.findAllAvalibaleColorsByPidAndSizeId(payloadObj);
  res.send({ status: "success", responseData });
});

router.post("/findAllAvalibaleSizesByPidAndColorId", async (req, res) => {
  console.log(req.body);
  const { payloadObj } = req.body;
  console.log("payloadObj is ::", payloadObj);
  const responseData = await productController.findAllAvalibaleSizesByPidAndColorId(payloadObj);
  res.send({ status: "success", responseData });
});

router.post("/searchByNameColorCategory", async (req, res) => {
  let data = {};
  try {
    console.log(req.body);
    const { payloadObj } = req.body;
    console.log("payloadObj is ::", payloadObj);
    data = await searchController.searchByNameColorCategory(payloadObj);
  } catch (error) {
    console.error(error);
    data.message = "API failed";
  }
  res.send({ status: "success", data });
});

export default router;