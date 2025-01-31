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

router.get("/findProductsByPdId", async (req, res) => {
  try {
    console.log(req.query); // Log the query parameters

    // Extract query parameters
    const {
      gender = "",
      size = "",
      color = "",
      priceStart = 0,
      priceEnd = 10000,
      fk_category_id = 5,
      defaultFlag = 1,
      page = 1,
    } = req.query;

    // Convert size and color to arrays if they are passed as strings
    const sizeArray = size ? size.split(",") : [];
    const colorArray = color ? color.split(",") : [];

    // Construct the payload object
    const payloadObj = {
      gender,
      size: sizeArray,
      color: colorArray,
      priceStart: Number(priceStart),
      priceEnd: Number(priceEnd),
      fk_category_id: Number(fk_category_id),
      defaultFlag: Number(defaultFlag),
      page: Number(page),
    };

    console.log("payloadObj is ::", payloadObj);

    // Call the controller function
    const responseData = await productController.findProductsByPdId(payloadObj);

    // Send the response
    res.status(200).send({ status: "success", responseData });
  } catch (error) {
    console.error("Error in /findProductsByPdId:", error); // Log the error for debugging
    res.status(500).send({ status: "error", message: "Some Internal Error Occurred" });
  }
});


router.get("/findProductsByCategoryName", async (req, res) => {
  try {
    const {
      categoryName,
      colorFilter,
      sizeFilter,
      sortBy = "updated_at",
      sortOrder = "DESC",
      page = 1,
      limit = 12,
      userId,
      gender
    } = req.query;

    if (!categoryName) {
      return res.status(400).json({ error: "categoryName is required" });
    }

    const colorArray = colorFilter ? colorFilter.split(",") : null;
    const sizeArray = sizeFilter ? sizeFilter.split(",") : null;

    const products = await productController.findProductsByCategoryName({
      categoryName,
      colorFilter: colorArray,
      sizeFilter: sizeArray,
      sortBy,
      sortOrder,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      userId,
      gender
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/findAllAvalibaleColorsByPidAndSizeId", async (req, res) => {
  console.log(req.body);
  const { payloadObj } = req.body;
  console.log("payloadObj is ::", payloadObj);
  const responseData =
    await productController.findAllAvalibaleColorsByPidAndSizeId(payloadObj);
  res.send({ status: "success", responseData });
});

router.post("/findAllAvalibaleSizesByPidAndColorId", async (req, res) => {
  console.log(req.body);
  const { payloadObj } = req.body;
  console.log("payloadObj is ::", payloadObj);
  const responseData =
    await productController.findAllAvalibaleSizesByPidAndColorId(payloadObj);
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
