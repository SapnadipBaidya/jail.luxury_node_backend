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

    console.log("colorFilter",colorFilter,"sizeFilter",sizeFilter)
    const colorArray = colorFilter ? colorFilter.split(",").map((item)=>parseInt(item)) : null;
    const sizeArray = sizeFilter ? sizeFilter.split(",").map((item)=>parseInt(item)) : null;
    console.log("colorArray",colorArray,"sizeArray",sizeArray)
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

router.get("/searchByNameColorCategory", async (req, res) => {
  const { userInput,page=1,limit=12 } = req.query;

  // Edge Case: Handle missing or invalid categoryName
  if (!userInput || typeof userInput !== "string" || userInput.trim() === "") {
    return res.status(400).send({
      status: "error",
      message: "Invalid or missing categoryName parameter.",
    });
  }

  try {
    console.log("userInput:", userInput);

    // Call the search function with userInput
    const data = await searchController.searchByNameColorCategory({
      userInput: userInput,page,limit
    });

    // Edge Case: Handle no results found
    if (data.length === 0 || data === "Nothing Found") {
      return res.status(404).send({
        status: "success",
        message: "No products found for the given category.",
        data: [],
      });
    }

    // Success response
    res.status(200).send(data);
  } catch (error) {
    console.error("Error in /searchByNameColorCategory:", error, {
      userInput,
    });

    // Error response
    res.status(500).send({
      status: "error",
      message: "An error occurred while processing your request.",
    });
  }
  }
);

export default router;
