// Import
const router = require("express").Router();
const itemsCategory =require("./itemsCategory");
const productCategory =  require("./products.js");
const wishlist = require("./wishlist.js")
const filters = require("./filters.js")
const cart = require("./cart.js")

router.use("/items", itemsCategory);
router.use("/products", productCategory);
router.use("/wishlist", wishlist);
router.use("/filters", filters);
router.use("/cart", cart);
// Export
module.exports = router;
