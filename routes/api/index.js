// Import
const router = require("express").Router();
const itemsCategory =require("./itemsCategory");
const productCategory =  require("./products.js");
const wishlist = require("./wishlist.js")

router.use("/items", itemsCategory);
router.use("/products", productCategory);
router.use("/wishlist", wishlist);

// Export
module.exports = router;
