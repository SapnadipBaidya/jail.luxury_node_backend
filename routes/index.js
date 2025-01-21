// Import
const router = require("express").Router();
const apiRoutes = require("./api");

router.use("/api", apiRoutes);
console.log(apiRoutes)
router.use((req, res) => {
  res.send("<h1>Wrong Route!</h1>");
});

// Export
module.exports = router;
