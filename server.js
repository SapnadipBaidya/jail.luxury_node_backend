// Import express
const express = require("express");
// Import routes files
const routes = require("./routes");
const cors = require("cors");
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { AppError, globalErrorHandler } = require("./middlewares/errorHandler");
// Import sequelize connection
const sequelize = require("./config/connection");

const app = express();
const PORT = process.env.PORT || 3001;


const rateLimiter = new RateLimiterMemory({
  points: process.env.IPLIMIT, // Number of requests
  duration: process.env.DURATION, // Per second
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip); // Consume 1 point per IP
    next();
  } catch (error) {
    res.status(429).send('Too Many Requests');
  }
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);


// Global Error Handler (must come after all routes)
app.use(globalErrorHandler);


// Syncs the database so table can be created and seeded using sequelize
// Allows for server to listen for routes

sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1); // Exit the application
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1); // Exit the application
});