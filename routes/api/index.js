// Import
const router = require("express").Router();
const itemsCategory =require("./itemsCategory");
const productCategory =  require("./products.js");

router.use("/items", itemsCategory);
router.use("/products", productCategory);

// Export
module.exports = router;
